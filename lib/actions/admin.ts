"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/repositories/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

async function adminClient() {
  await requireAdmin();
  if (!isSupabaseConfigured)
    throw new Error("Supabase credentials are required to save changes.");
  return createAdminClient();
}

function optional(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function boolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

async function upload(
  bucket: string,
  folder: string,
  file: File | null,
  maxSize: number,
  allowed: string[]
) {
  if (!file || file.size === 0) return null;
  if (file.size > maxSize) throw new Error("Uploaded file is too large.");
  if (!allowed.includes(file.type)) throw new Error("Unsupported file type.");

  const supabase = createAdminClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function createBookAction(formData: FormData) {
  const supabase = await adminClient();
  const name = z.string().min(2).max(200).parse(formData.get("name"));
  const regularPrice = z.coerce
    .number()
    .nonnegative()
    .parse(formData.get("regular_price"));
  const discountValue = optional(formData.get("discount_price"));
  const discountPrice = discountValue ? Number(discountValue) : null;
  if (discountPrice !== null && discountPrice >= regularPrice) {
    throw new Error("Discount price must be lower than regular price.");
  }

  const cover = await upload(
    "book-covers",
    slugify(name),
    formData.get("cover") as File | null,
    10 * 1024 * 1024,
    ["image/jpeg", "image/png", "image/webp", "image/avif"]
  );

  const { data: book, error } = await supabase
    .from("books")
    .insert({
      name,
      slug: slugify(optional(formData.get("slug")) ?? name),
      writer_id: optional(formData.get("writer_id")),
      category_id: optional(formData.get("category_id")),
      publisher: optional(formData.get("publisher")),
      isbn: optional(formData.get("isbn")),
      language: optional(formData.get("language")) ?? "English",
      pages: optional(formData.get("pages"))
        ? Number(formData.get("pages"))
        : null,
      edition: optional(formData.get("edition")),
      stock: Number(formData.get("stock") ?? 0),
      description: String(formData.get("description") ?? ""),
      regular_price: regularPrice,
      discount_price: discountPrice,
      cover_url: cover?.url ?? null,
      cover_path: cover?.path ?? null,
      featured: boolean(formData.get("featured")),
      trending: boolean(formData.get("trending")),
      new_arrival: boolean(formData.get("new_arrival")),
      best_seller: boolean(formData.get("best_seller")),
      is_active: boolean(formData.get("is_active")),
      seo_title: optional(formData.get("seo_title")),
      seo_description: optional(formData.get("seo_description"))
    })
    .select("id")
    .single();
  if (error) {
    if (cover) await supabase.storage.from("book-covers").remove([cover.path]);
    throw error;
  }

  const preview = formData.get("preview") as File | null;
  if (preview?.size) {
    const uploaded = await upload(
      "book-preview",
      book.id,
      preview,
      25 * 1024 * 1024,
      ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    );
    if (uploaded) {
      await supabase.from("book_previews").insert({
        book_id: book.id,
        type: preview.type === "application/pdf" ? "pdf" : "image",
        url: preview.type === "application/pdf" ? null : uploaded.url,
        storage_path: uploaded.path,
        sort_order: 1
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/books");
  redirect("/admin/books?created=true");
}

export async function updateBookAction(formData: FormData) {
  const supabase = await adminClient();
  const id = z.string().uuid().parse(formData.get("id"));
  const name = z.string().min(2).max(200).parse(formData.get("name"));
  const regularPrice = z.coerce
    .number()
    .nonnegative()
    .parse(formData.get("regular_price"));
  const discountValue = optional(formData.get("discount_price"));
  const discountPrice = discountValue ? Number(discountValue) : null;
  if (discountPrice !== null && discountPrice >= regularPrice) {
    throw new Error("Discount price must be lower than regular price.");
  }

  const { data: existing } = await supabase
    .from("books")
    .select("cover_path")
    .eq("id", id)
    .single();
  const cover = await upload(
    "book-covers",
    slugify(name),
    formData.get("cover") as File | null,
    10 * 1024 * 1024,
    ["image/jpeg", "image/png", "image/webp", "image/avif"]
  );

  const payload: Record<string, string | number | boolean | null> = {
    name,
    slug: slugify(optional(formData.get("slug")) ?? name),
    writer_id: optional(formData.get("writer_id")),
    category_id: optional(formData.get("category_id")),
    publisher: optional(formData.get("publisher")),
    isbn: optional(formData.get("isbn")),
    language: optional(formData.get("language")) ?? "English",
    pages: optional(formData.get("pages"))
      ? Number(formData.get("pages"))
      : null,
    edition: optional(formData.get("edition")),
    stock: Number(formData.get("stock") ?? 0),
    description: String(formData.get("description") ?? ""),
    regular_price: regularPrice,
    discount_price: discountPrice,
    featured: boolean(formData.get("featured")),
    trending: boolean(formData.get("trending")),
    new_arrival: boolean(formData.get("new_arrival")),
    best_seller: boolean(formData.get("best_seller")),
    is_active: boolean(formData.get("is_active")),
    seo_title: optional(formData.get("seo_title")),
    seo_description: optional(formData.get("seo_description"))
  };
  if (cover) {
    payload.cover_url = cover.url;
    payload.cover_path = cover.path;
  }
  const { error } = await supabase.from("books").update(payload).eq("id", id);
  if (error) {
    if (cover) await supabase.storage.from("book-covers").remove([cover.path]);
    throw error;
  }
  if (cover && existing?.cover_path)
    await supabase.storage.from("book-covers").remove([existing.cover_path]);

  const preview = formData.get("preview") as File | null;
  if (preview?.size) {
    const uploaded = await upload(
      "book-preview",
      id,
      preview,
      25 * 1024 * 1024,
      ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    );
    if (uploaded) {
      await supabase.from("book_previews").insert({
        book_id: id,
        type: preview.type === "application/pdf" ? "pdf" : "image",
        url: preview.type === "application/pdf" ? null : uploaded.url,
        storage_path: uploaded.path,
        sort_order: 1
      });
    }
  }
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/books");
  redirect("/admin/books?updated=true");
}

export async function deleteBookAction(formData: FormData) {
  const supabase = await adminClient();
  const id = z.string().uuid().parse(formData.get("id"));
  const [{ data: book }, { data: images }, { data: previews }] =
    await Promise.all([
      supabase.from("books").select("cover_path").eq("id", id).single(),
      supabase.from("book_images").select("storage_path").eq("book_id", id),
      supabase.from("book_previews").select("storage_path").eq("book_id", id)
    ]);
  if (book?.cover_path)
    await supabase.storage.from("book-covers").remove([book.cover_path]);
  const galleryPaths = (images ?? [])
    .map((item) => item.storage_path)
    .filter(Boolean) as string[];
  const previewPaths = (previews ?? [])
    .map((item) => item.storage_path)
    .filter(Boolean) as string[];
  if (galleryPaths.length)
    await supabase.storage.from("book-gallery").remove(galleryPaths);
  if (previewPaths.length)
    await supabase.storage.from("book-preview").remove(previewPaths);
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/books");
  revalidatePath("/shop");
}

export async function createCategoryAction(formData: FormData) {
  const supabase = await adminClient();
  const name = z.string().min(2).max(100).parse(formData.get("name"));
  const image = await upload(
    "category-images",
    slugify(name),
    formData.get("image") as File | null,
    5 * 1024 * 1024,
    ["image/jpeg", "image/png", "image/webp", "image/avif"]
  );
  const { error } = await supabase.from("categories").insert({
    name,
    slug: slugify(optional(formData.get("slug")) ?? name),
    description: optional(formData.get("description")),
    image_url: image?.url ?? null,
    image_path: image?.path ?? null,
    is_active: true
  });
  if (error) throw error;
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function createWriterAction(formData: FormData) {
  const supabase = await adminClient();
  const name = z.string().min(2).max(120).parse(formData.get("name"));
  const photo = await upload(
    "writer-images",
    slugify(name),
    formData.get("photo") as File | null,
    5 * 1024 * 1024,
    ["image/jpeg", "image/png", "image/webp", "image/avif"]
  );
  const { error } = await supabase.from("writers").insert({
    name,
    slug: slugify(optional(formData.get("slug")) ?? name),
    biography: optional(formData.get("biography")),
    photo_url: photo?.url ?? null,
    photo_path: photo?.path ?? null,
    is_active: true
  });
  if (error) throw error;
  revalidatePath("/admin/writers");
  revalidatePath("/writers");
}

export async function createCouponAction(formData: FormData) {
  const supabase = await adminClient();
  const payload = {
    code: z
      .string()
      .min(3)
      .max(30)
      .parse(formData.get("code"))
      .toUpperCase(),
    discount_type: z
      .enum(["fixed", "percentage"])
      .parse(formData.get("discount_type")),
    discount_value: z.coerce
      .number()
      .positive()
      .parse(formData.get("discount_value")),
    minimum_purchase: z.coerce
      .number()
      .nonnegative()
      .parse(formData.get("minimum_purchase")),
    expires_at: optional(formData.get("expires_at")),
    max_usage: optional(formData.get("max_usage"))
      ? Number(formData.get("max_usage"))
      : null,
    max_usage_per_user: optional(formData.get("max_usage_per_user"))
      ? Number(formData.get("max_usage_per_user"))
      : null,
    is_active: true
  };
  const { error } = await supabase.from("coupons").insert(payload);
  if (error) throw error;
  revalidatePath("/admin/coupons");
}

export async function createBannerAction(formData: FormData) {
  const supabase = await adminClient();
  const title = z.string().min(2).max(200).parse(formData.get("title"));
  const image = await upload(
    "hero-banners",
    slugify(title),
    formData.get("image") as File | null,
    15 * 1024 * 1024,
    ["image/jpeg", "image/png", "image/webp", "image/avif"]
  );
  if (!image) throw new Error("A banner image is required.");
  const { error } = await supabase.from("hero_banners").insert({
    title,
    subtitle: optional(formData.get("subtitle")),
    button_text: optional(formData.get("button_text")),
    button_url: optional(formData.get("button_url")),
    image_url: image.url,
    image_path: image.path,
    is_active: true,
    sort_order: Number(formData.get("sort_order") ?? 0)
  });
  if (error) {
    await supabase.storage.from("hero-banners").remove([image.path]);
    throw error;
  }
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteResourceAction(formData: FormData) {
  const supabase = await adminClient();
  const id = z.string().uuid().parse(formData.get("id"));
  const resource = z
    .enum(["categories", "writers", "coupons"])
    .parse(formData.get("resource"));

  if (resource === "categories") {
    const { data } = await supabase
      .from("categories")
      .select("image_path")
      .eq("id", id)
      .single();
    if (data?.image_path)
      await supabase.storage.from("category-images").remove([data.image_path]);
  }
  if (resource === "writers") {
    const { data } = await supabase
      .from("writers")
      .select("photo_path")
      .eq("id", id)
      .single();
    if (data?.photo_path)
      await supabase.storage.from("writer-images").remove([data.photo_path]);
  }

  const { error } = await supabase.from(resource).delete().eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/${resource}`);
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function deleteBannerAction(formData: FormData) {
  const supabase = await adminClient();
  const id = z.string().uuid().parse(formData.get("id"));
  const { data: banner } = await supabase
    .from("hero_banners")
    .select("image_path")
    .eq("id", id)
    .single();
  if (banner?.image_path)
    await supabase.storage.from("hero-banners").remove([banner.image_path]);
  const { error } = await supabase.from("hero_banners").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function updateOrderStatusAction(formData: FormData) {
  const supabase = await adminClient();
  const orderId = z.string().uuid().parse(formData.get("order_id"));
  const status = z
    .enum([
      "pending",
      "confirmed",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
      "returned"
    ])
    .parse(formData.get("status"));
  const { error } = await supabase.rpc("admin_update_order_status", {
    target_order_id: orderId,
    next_status: status,
    status_note: optional(formData.get("note"))
  });
  if (error) throw error;
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateSettingsAction(formData: FormData) {
  const supabase = await adminClient();
  const textFields = [
    "store_name",
    "phone",
    "whatsapp",
    "facebook_url",
    "messenger_url",
    "instagram_url",
    "support_email",
    "support_phone",
    "address",
    "payment_number",
    "payment_instruction",
    "homepage_title",
    "homepage_subtitle",
    "seo_title",
    "seo_description",
    "footer_text",
    "copyright",
    "confirmation_message",
    "google_analytics_id",
    "meta_pixel_id"
  ] as const;
  const payload: Record<string, string | number | null> = {};
  textFields.forEach((key) => {
    payload[key] = optional(formData.get(key));
  });
  payload.delivery_inside_dhaka = Number(
    formData.get("delivery_inside_dhaka")
  );
  payload.delivery_outside_dhaka = Number(
    formData.get("delivery_outside_dhaka")
  );
  const { error } = await supabase
    .from("settings")
    .update(payload)
    .eq("id", true);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/settings");
}
