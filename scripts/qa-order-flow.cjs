const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");

const root = path.resolve(__dirname, "..");
const port = 4174;
const baseUrl = `http://127.0.0.1:${port}`;
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const createdOrderNumbers = [];
const preservedOrderNumbers = new Set();
const browserErrors = [];
const browserDiagnostics = [];

loadEnv(path.join(root, ".env"));

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

let server;
let browser;
let authenticatedAdmin;
let couponBaseline;
let couponId;

function loadEnv(file) {
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

function normalizedEnvironment() {
  const environment = {};
  let windowsPath = "";

  for (const [key, value] of Object.entries(process.env)) {
    if (key.toLowerCase() === "path") {
      windowsPath ||= value ?? "";
    } else if (value !== undefined) {
      environment[key] = value;
    }
  }

  environment.PATH = windowsPath;
  return environment;
}

function assert(condition, message, context) {
  if (condition) return;
  const details =
    context === undefined ? "" : `\n${JSON.stringify(context, null, 2)}`;
  throw new Error(`${message}${details}`);
}

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited before QA started: ${server.exitCode}`);
    }

    try {
      const response = await fetch(`${baseUrl}/admin/login`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("Next.js did not become ready for order QA.");
}

function startServer() {
  const nextBin = path.join(
    root,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next"
  );
  server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: root,
    env: normalizedEnvironment(),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));
}

async function getAdminSession(adminId) {
  const { data: authUsers, error: authUsersError } =
    await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
  assert(
    !authUsersError,
    "Could not read Supabase Authentication users.",
    authUsersError
  );

  const promotedAdmin = authUsers.users.find((user) => user.id === adminId);
  assert(
    promotedAdmin?.email,
    "The promoted admin has no matching Authentication user."
  );

  const { data: linkData, error: linkError } =
    await service.auth.admin.generateLink({
      type: "magiclink",
      email: promotedAdmin.email
    });
  assert(
    !linkError && linkData?.properties?.hashed_token,
    "Could not establish an admin QA session.",
    linkError
  );

  authenticatedAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data, error } = await authenticatedAdmin.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink"
  });
  assert(!error && data.session, "Admin QA authentication failed.", error);
  return data.session;
}

function createSessionCookies(session) {
  const projectRef = new URL(
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ).hostname.split(".")[0];
  const key = `sb-${projectRef}-auth-token`;
  const encoded = `base64-${Buffer.from(
    JSON.stringify(session),
    "utf8"
  ).toString("base64url")}`;
  const chunks = [];

  if (encoded.length <= 3180) {
    chunks.push({ name: key, value: encoded });
  } else {
    for (let offset = 0, index = 0; offset < encoded.length; index += 1) {
      chunks.push({
        name: `${key}.${index}`,
        value: encoded.slice(offset, offset + 3180)
      });
      offset += 3180;
    }
  }

  return chunks.map((cookie) => ({
    ...cookie,
    url: baseUrl,
    sameSite: "Lax"
  }));
}

async function verifyLoginPage() {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });

  assert(
    (await page.getByLabel("Email", { exact: true }).count()) === 1,
    "Admin login does not contain exactly one Email input."
  );
  assert(
    (await page.getByLabel("Password", { exact: true }).count()) === 1,
    "Admin login does not contain exactly one Password input."
  );
  assert(
    (await page.getByRole("button", { name: "Login", exact: true }).count()) ===
      1,
    "Admin login does not contain exactly one Login button."
  );
  assert(
    (await page.locator("input").count()) === 2 &&
      (await page.locator("button").count()) === 1,
    "Admin login contains controls other than Email, Password, and Login."
  );

  const text = await page.locator("body").innerText();
  assert(
    !/first-time|sign.?up|create (?:the )?owner|claim_initial_admin/i.test(
      text
    ),
    "Owner/setup language remains on the admin login page.",
    text
  );
  await context.close();
}

function monitorPage(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(`${label} console: ${message.text()}`);
    }
  });
  page.on("response", (response) => {
    if (
      response.url().startsWith(baseUrl) &&
      response.status() >= 500
    ) {
      browserErrors.push(
        `${label} HTTP ${response.status()}: ${response.url()}`
      );
    }
  });
  page.on("pageerror", (error) => {
    browserErrors.push(`${label} page: ${error.message}`);
  });
  page.on("websocket", (websocket) => {
    if (!websocket.url().includes("/realtime/")) return;
    browserDiagnostics.push(`${label} realtime opened`);
    websocket.on("framesent", (event) => {
      const summary = summarizeRealtimeFrame(event.payload);
      if (summary) browserDiagnostics.push(`${label} sent ${summary}`);
    });
    websocket.on("framereceived", (event) => {
      const summary = summarizeRealtimeFrame(event.payload);
      if (summary) browserDiagnostics.push(`${label} received ${summary}`);
    });
    websocket.on("close", () => {
      browserDiagnostics.push(`${label} realtime closed`);
    });
  });
}

function summarizeRealtimeFrame(payload) {
  if (typeof payload !== "string") return null;
  try {
    const frame = JSON.parse(payload);
    if (!Array.isArray(frame) || frame.length < 5) return null;
    const topic = frame[2];
    const event = frame[3];
    const body = frame[4];
    if (
      event !== "phx_join" &&
      event !== "phx_reply" &&
      event !== "postgres_changes" &&
      event !== "access_token"
    ) {
      return null;
    }
    const status =
      body && typeof body === "object" && "status" in body
        ? ` status=${body.status}`
        : "";
    let auth = "";
    if (event === "phx_join") {
      if (
        body &&
        typeof body === "object" &&
        typeof body.access_token === "string"
      ) {
        const claims = JSON.parse(
          Buffer.from(body.access_token.split(".")[1], "base64url").toString(
            "utf8"
          )
        );
        auth = ` auth_role=${claims.role ?? "unknown"}`;
      } else {
        auth = " auth_role=none";
      }
    }
    return `topic=${topic} event=${event}${status}${auth}`;
  } catch {
    return null;
  }
}

async function fillCheckout(page, name, zone) {
  await page.getByLabel("Full name", { exact: true }).fill(name);
  await page.getByLabel("Phone number", { exact: true }).fill("01700000000");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("checkout.qa@example.com");
  await page.getByLabel("District", { exact: true }).fill("Dhaka");
  await page.getByLabel("Area", { exact: true }).fill("Dhanmondi");
  await page.locator("select").first().selectOption(zone);
  await page
    .getByLabel("Full address", { exact: true })
    .fill("House 1, Road 2, Dhanmondi, Dhaka");
  await page
    .getByLabel("Order notes (optional)", { exact: true })
    .fill("Automated end-to-end verification");
}

async function addBookAndCheckout(page, book) {
  await page.goto(`${baseUrl}/books/${book.slug}`, {
    waitUntil: "networkidle"
  });
  await page
    .getByRole("button", { name: "Add to cart", exact: true })
    .first()
    .click();
  await page.waitForFunction(
    (bookId) =>
      window.localStorage
        .getItem("mini-book-cottage-cart")
        ?.includes(bookId),
    book.id
  );
  await page.goto(`${baseUrl}/checkout`, { waitUntil: "networkidle" });
  await page.getByText(book.name).first().waitFor({ state: "visible" });
}

async function placeCodOrder(page, book, coupon) {
  await addBookAndCheckout(page, book);
  await fillCheckout(page, "COD Checkout QA", "inside_dhaka");

  const orderPostsBefore = [];
  const capturePost = (request) => {
    if (
      request.url() === `${baseUrl}/api/orders` &&
      request.method() === "POST"
    ) {
      orderPostsBefore.push(request);
    }
  };
  page.on("request", capturePost);
  await page
    .getByRole("button", { name: "Place order", exact: true })
    .click();
  const transactionValidity = await page
    .getByLabel("Transaction ID", { exact: true })
    .evaluate((input) => ({
      valid: input.checkValidity(),
      valueMissing: input.validity.valueMissing
    }));
  assert(
    !transactionValidity.valid &&
      transactionValidity.valueMissing &&
      orderPostsBefore.length === 0,
    "COD transaction ID is not enforced by frontend validation.",
    transactionValidity
  );
  page.off("request", capturePost);

  const couponResponsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${baseUrl}/api/coupons/validate` &&
      response.request().method() === "POST"
  );
  await page.getByPlaceholder("Coupon code").fill(coupon.code);
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  const couponResponse = await couponResponsePromise;
  const couponBody = await couponResponse.json();
  assert(
    couponResponse.status() === 200,
    "Coupon validation failed through the checkout UI.",
    couponBody
  );

  const transactionId = `QA-COD-${Date.now()}`;
  await page
    .getByLabel("Transaction ID", { exact: true })
    .fill(transactionId);
  const orderResponsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${baseUrl}/api/orders` &&
      response.request().method() === "POST"
  );
  await page
    .getByRole("button", { name: "Place order", exact: true })
    .click();
  const orderResponse = await orderResponsePromise;
  const body = await orderResponse.json();
  assert(
    orderResponse.status() === 201,
    "COD order failed through the checkout UI.",
    body
  );
  createdOrderNumbers.push(body.order_number);
  await page.waitForURL("**/order-success?**");
  await page.getByText("Thank you for your order.", { exact: true }).waitFor();
  await page.getByText("Live order status", { exact: true }).waitFor();
  assert(
    page.url().includes(encodeURIComponent(body.order_number)),
    "COD confirmation URL is missing the order number."
  );
  return { ...body, transactionId, couponBody };
}

async function placeOnlineOrder(page, book) {
  await addBookAndCheckout(page, book);
  await fillCheckout(page, "Online Checkout QA", "outside_dhaka");
  await page
    .getByRole("button", { name: /Online payment/ })
    .click();
  assert(
    (await page.getByLabel("Transaction ID", { exact: true }).count()) === 0,
    "Online placeholder still renders the COD transaction field."
  );

  const orderResponsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${baseUrl}/api/orders` &&
      response.request().method() === "POST"
  );
  await page
    .getByRole("button", { name: "Place order", exact: true })
    .click();
  const orderResponse = await orderResponsePromise;
  const body = await orderResponse.json();
  assert(
    orderResponse.status() === 201,
    "Online placeholder order failed through the checkout UI.",
    body
  );
  createdOrderNumbers.push(body.order_number);
  await page.waitForURL("**/order-success?**");
  await page.getByText("Thank you for your order.", { exact: true }).waitFor();
  await page.getByText("Live order status", { exact: true }).waitFor();
  return body;
}

async function verifyRouteValidation(book) {
  const common = {
    customer_name: "Validation QA",
    phone: "01700000000",
    email: "checkout.qa@example.com",
    district: "Dhaka",
    area: "Dhanmondi",
    address: "House 1, Road 2, Dhanmondi, Dhaka",
    delivery_zone: "inside_dhaka",
    payment_method: "cash_on_delivery",
    items: [{ book_id: book.id, quantity: 1 }]
  };
  const headers = {
    Origin: baseUrl,
    "Content-Type": "application/json"
  };

  const missingTransaction = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...common, transaction_id: "" })
  });
  const transactionBody = await missingTransaction.json();
  assert(
    missingTransaction.status === 400 &&
      transactionBody.error ===
        "The delivery-charge transaction ID is required.",
    "Server-side COD transaction validation failed.",
    transactionBody
  );

  const invalidBook = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...common,
      transaction_id: "QA-INVALID-BOOK",
      items: [{ book_id: "book-1", quantity: 1 }]
    })
  });
  const invalidBookBody = await invalidBook.json();
  assert(
    invalidBook.status === 400 && /uuid/i.test(invalidBookBody.error),
    "Invalid/stale cart book IDs are not rejected by type validation.",
    invalidBookBody
  );
  return {
    transaction: transactionBody.error,
    invalidBook: invalidBookBody.error
  };
}

async function verifyDatabase({
  book,
  coupon,
  settings,
  cod,
  online
}) {
  const { data: orders, error: ordersError } = await service
    .from("orders")
    .select(
      "id,order_number,public_token,delivery_zone,subtotal,coupon_code,discount,delivery_charge,grand_total,payment_method,payment_status,transaction_id,status,created_at"
    )
    .in("order_number", createdOrderNumbers);
  assert(
    !ordersError && orders?.length === 2,
    "Expected order rows were not inserted.",
    { orders, ordersError }
  );

  const codRow = orders.find(
    (order) => order.order_number === cod.order_number
  );
  const onlineRow = orders.find(
    (order) => order.order_number === online.order_number
  );
  assert(codRow && onlineRow, "Inserted orders could not be matched.", orders);

  const unitPrice = Number(book.discount_price ?? book.regular_price);
  const expectedDiscount =
    coupon.discount_type === "fixed"
      ? Number(coupon.discount_value)
      : Math.round((unitPrice * Number(coupon.discount_value)) / 100);
  const discount = Math.min(expectedDiscount, unitPrice);

  assert(
    Number(codRow.subtotal) === unitPrice &&
      Number(codRow.discount) === discount &&
      Number(codRow.delivery_charge) ===
        Number(settings.delivery_inside_dhaka) &&
      Number(codRow.grand_total) ===
        unitPrice -
          discount +
          Number(settings.delivery_inside_dhaka) &&
      codRow.coupon_code === coupon.code &&
      codRow.payment_method === "cash_on_delivery" &&
      codRow.payment_status === "delivery_charge_submitted" &&
      codRow.transaction_id === cod.transactionId &&
      codRow.status === "pending",
    "COD order totals or payment fields are incorrect.",
    codRow
  );
  assert(
    Number(onlineRow.subtotal) === unitPrice &&
      Number(onlineRow.discount) === 0 &&
      Number(onlineRow.delivery_charge) ===
        Number(settings.delivery_outside_dhaka) &&
      Number(onlineRow.grand_total) ===
        unitPrice + Number(settings.delivery_outside_dhaka) &&
      onlineRow.payment_method === "online" &&
      onlineRow.payment_status === "pending" &&
      onlineRow.transaction_id === null &&
      onlineRow.status === "pending",
    "Online order totals or payment fields are incorrect.",
    onlineRow
  );

  const orderIds = orders.map((order) => order.id);
  const [
    { data: items, error: itemsError },
    { data: events, error: eventsError },
    { data: couponAfter, error: couponAfterError }
  ] = await Promise.all([
    service
      .from("order_items")
      .select(
        "order_id,book_id,book_name,quantity,unit_price,line_total"
      )
      .in("order_id", orderIds),
    service
      .from("order_status_events")
      .select("order_id,status,note,created_at")
      .in("order_id", orderIds)
      .order("created_at"),
    service
      .from("coupons")
      .select("usage_count")
      .eq("id", coupon.id)
      .single()
  ]);
  assert(
    !itemsError && items?.length === 2,
    "Order item rows were not created.",
    { items, itemsError }
  );
  assert(
    items.every(
      (item) =>
        item.book_id === book.id &&
        item.book_name === book.name &&
        item.quantity === 1 &&
        Number(item.unit_price) === unitPrice &&
        Number(item.line_total) === unitPrice
    ),
    "Order item details are incorrect.",
    items
  );
  assert(
    !eventsError &&
      events?.length === 2 &&
      events.every(
        (event) =>
          event.status === "pending" && event.note === "Order received"
      ),
    "Initial order timeline rows are incorrect.",
    { events, eventsError }
  );
  assert(
    !couponAfterError &&
      Number(couponAfter.usage_count) === couponBaseline + 1,
    "Coupon usage was not incremented exactly once.",
    couponAfter
  );

  for (const placed of [cod, online]) {
    const response = await fetch(
      `${baseUrl}/api/orders/status?order=${encodeURIComponent(
        placed.order_number
      )}&token=${encodeURIComponent(placed.tracking_token)}`
    );
    const body = await response.json();
    assert(
      response.status === 200 &&
        body.status === "pending" &&
        body.events?.[0]?.note === "Order received",
      "Public order status endpoint returned incorrect data.",
      body
    );
  }

  const { data: adminOrders, error: adminOrdersError } =
    await authenticatedAdmin
      .from("orders")
      .select(
        "id,order_number,customer_name,grand_total,status,created_at,order_items(id,book_name,quantity,unit_price,line_total)"
      )
      .in("order_number", createdOrderNumbers);
  assert(
    !adminOrdersError &&
      adminOrders?.length === 2 &&
      adminOrders.every((order) => order.order_items?.length === 1),
    "Authenticated admin RLS query cannot see complete order details.",
    { adminOrders, adminOrdersError }
  );

  return { orders, items, events, adminOrders };
}

async function cleanup() {
  const ordersToDelete = createdOrderNumbers.filter(
    (orderNumber) => !preservedOrderNumbers.has(orderNumber)
  );
  if (ordersToDelete.length) {
    const { error } = await service
      .from("orders")
      .delete()
      .in("order_number", ordersToDelete);
    if (error) console.error(`Could not delete QA orders: ${error.message}`);
  }
  if (
    couponId &&
    couponBaseline !== undefined &&
    preservedOrderNumbers.size === 0
  ) {
    const { error } = await service
      .from("coupons")
      .update({ usage_count: couponBaseline })
      .eq("id", couponId);
    if (error) {
      console.error(`Could not restore coupon usage: ${error.message}`);
    }
  }
  if (authenticatedAdmin) await authenticatedAdmin.auth.signOut();
  if (browser) await browser.close();
  if (server && server.exitCode === null) server.kill();
}

async function main() {
  assert(
    fs.existsSync(path.join(root, ".next", "BUILD_ID")),
    "Run npm run build before npm run qa:orders."
  );
  assert(fs.existsSync(chromePath), `Chrome was not found at ${chromePath}.`);

  startServer();
  await waitForServer();

  const [
    { data: books, error: booksError },
    { data: coupon, error: couponError },
    { data: settings, error: settingsError },
    { data: admins, error: adminsError }
  ] = await Promise.all([
    service
      .from("books")
      .select(
        "id,name,slug,stock,regular_price,discount_price,is_active"
      )
      .eq("is_active", true)
      .gte("stock", 2)
      .order("regular_price")
      .limit(20),
    service
      .from("coupons")
      .select(
        "id,code,discount_type,discount_value,minimum_purchase,usage_count"
      )
      .eq("code", "COTTAGE50")
      .single(),
    service
      .from("settings")
      .select("delivery_inside_dhaka,delivery_outside_dhaka")
      .eq("id", true)
      .single(),
    service.from("admins").select("id").limit(1)
  ]);
  assert(!booksError && books?.length, "No checkout book is available.");
  assert(!couponError && coupon, "COTTAGE50 coupon is unavailable.");
  assert(!settingsError && settings, "Delivery settings are unavailable.");
  assert(!adminsError && admins?.length, "No promoted admin exists.");

  const book = books.find(
    (entry) =>
      Number(entry.discount_price ?? entry.regular_price) >=
      Number(coupon.minimum_purchase)
  );
  assert(book, "No available book meets the coupon minimum.");
  couponBaseline = Number(coupon.usage_count);
  couponId = coupon.id;

  const session = await getAdminSession(admins[0].id);
  browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });

  await verifyLoginPage();
  const validation = await verifyRouteValidation(book);

  const adminContext = await browser.newContext();
  await adminContext.addCookies(createSessionCookies(session));
  const adminPage = await adminContext.newPage();
  monitorPage(adminPage, "admin");
  await adminPage.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
  await adminPage.getByText("Recent orders", { exact: true }).waitFor();
  await adminPage.waitForTimeout(1500);

  const storeContext = await browser.newContext();
  await storeContext.addInitScript(() => {
    if (!window.sessionStorage.getItem("qa-cart-cleared")) {
      window.localStorage.removeItem("mini-book-cottage-cart");
      window.sessionStorage.setItem("qa-cart-cleared", "true");
    }
  });
  const storePage = await storeContext.newPage();
  monitorPage(storePage, "store");

  const cod = await placeCodOrder(storePage, book, coupon);
  if (process.env.KEEP_QA_COD_ORDER === "1") {
    preservedOrderNumbers.add(cod.order_number);
  }
  await adminPage
    .getByText(cod.order_number, { exact: true })
    .waitFor({ timeout: 15_000 });

  const online = await placeOnlineOrder(storePage, book);
  await adminPage
    .getByText(online.order_number, { exact: true })
    .waitFor({ timeout: 15_000 });

  await adminPage.goto(`${baseUrl}/admin/orders`, {
    waitUntil: "networkidle"
  });
  await adminPage.getByText(cod.order_number, { exact: true }).waitFor();
  await adminPage.getByText(online.order_number, { exact: true }).waitFor();
  await adminPage.getByText(cod.transactionId, { exact: true }).waitFor();
  assert(
    (await adminPage.getByText(book.name).count()) >= 2,
    "Admin order details do not include both line items."
  );

  const database = await verifyDatabase({
    book,
    coupon,
    settings,
    cod,
    online
  });
  assert(
    browserErrors.length === 0,
    "Browser or application errors occurred during QA.",
    browserErrors
  );

  const codRow = database.orders.find(
    (order) => order.order_number === cod.order_number
  );
  const onlineRow = database.orders.find(
    (order) => order.order_number === online.order_number
  );
  console.log(
    JSON.stringify(
      {
        passed: true,
        login: "Email, Password, Login only",
        route_validation: validation,
        coupon: {
          code: coupon.code,
          discount: cod.couponBody.discount,
          usage_incremented: true
        },
        cod_order: {
          order_number: codRow.order_number,
          subtotal: Number(codRow.subtotal),
          discount: Number(codRow.discount),
          delivery_charge: Number(codRow.delivery_charge),
          grand_total: Number(codRow.grand_total),
          payment_status: codRow.payment_status,
          status: codRow.status
        },
        online_order: {
          order_number: onlineRow.order_number,
          subtotal: Number(onlineRow.subtotal),
          delivery_charge: Number(onlineRow.delivery_charge),
          grand_total: Number(onlineRow.grand_total),
          payment_status: onlineRow.payment_status,
          status: onlineRow.status
        },
        order_items: database.items.length,
        timeline_events: database.events.length,
        confirmation_pages: "passed",
        tracking_endpoints: "passed",
        admin_dashboard_realtime: "both orders appeared without reload",
        admin_order_details: "both orders and line items visible",
        authenticated_admin_rls: `${database.adminOrders.length} orders visible`,
        preserved_cod_order:
          preservedOrderNumbers.size > 0 ? cod.order_number : null
      },
      null,
      2
    )
  );

  await adminContext.close();
  await storeContext.close();
}

main()
  .catch((error) => {
    console.error(error.stack ?? error.message ?? error);
    if (browserErrors.length) {
      console.error("Browser errors:", JSON.stringify(browserErrors, null, 2));
    }
    if (browserDiagnostics.length) {
      console.error(
        "Browser diagnostics:",
        JSON.stringify(browserDiagnostics, null, 2)
      );
    }
    process.exitCode = 1;
  })
  .finally(cleanup);
