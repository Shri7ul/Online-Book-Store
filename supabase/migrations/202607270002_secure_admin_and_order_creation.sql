drop function if exists public.claim_initial_admin();

create or replace function public.create_store_order(
  order_input jsonb,
  generated_order_number text,
  generated_public_token uuid
)
returns table (
  created_order_number text,
  tracking_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  selected_book public.books%rowtype;
  selected_coupon public.coupons%rowtype;
  store_settings public.settings%rowtype;
  created_order_id uuid;
  requested_book_id uuid;
  seen_book_ids uuid[] := array[]::uuid[];
  requested_quantity integer;
  unit_price numeric(12,2);
  calculated_subtotal numeric(12,2) := 0;
  calculated_discount numeric(12,2) := 0;
  calculated_delivery numeric(12,2);
  calculated_total numeric(12,2);
  requested_coupon_code text;
  requested_transaction_id text;
  requested_delivery_zone public.delivery_zone;
  requested_payment_method public.payment_method;
begin
  if order_input is null or jsonb_typeof(order_input) <> 'object' then
    raise exception using errcode = 'P0001', message = 'Invalid order details.';
  end if;

  if generated_order_number is null
     or btrim(generated_order_number) = ''
     or generated_public_token is null then
    raise exception using
      errcode = 'P0001',
      message = 'Invalid order reference.';
  end if;

  if jsonb_typeof(order_input -> 'items') <> 'array'
     or jsonb_array_length(order_input -> 'items') = 0 then
    raise exception using errcode = 'P0001', message = 'Your cart is empty.';
  end if;

  begin
    requested_delivery_zone :=
      (order_input ->> 'delivery_zone')::public.delivery_zone;
    requested_payment_method :=
      (order_input ->> 'payment_method')::public.payment_method;
  exception
    when invalid_text_representation then
      raise exception using
        errcode = 'P0001',
        message = 'Invalid delivery zone or payment method.';
  end;

  requested_coupon_code :=
    nullif(upper(btrim(order_input ->> 'coupon_code')), '');
  requested_transaction_id :=
    nullif(btrim(order_input ->> 'transaction_id'), '');

  if requested_payment_method = 'cash_on_delivery'
     and requested_transaction_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'The delivery-charge transaction ID is required.';
  end if;

  select *
  into store_settings
  from public.settings
  where id = true;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'Store delivery settings are unavailable.';
  end if;

  calculated_delivery := case requested_delivery_zone
    when 'inside_dhaka' then store_settings.delivery_inside_dhaka
    else store_settings.delivery_outside_dhaka
  end;

  for item in
    select value from jsonb_array_elements(order_input -> 'items')
  loop
    begin
      requested_book_id := (item ->> 'book_id')::uuid;
      requested_quantity := (item ->> 'quantity')::integer;
    exception
      when invalid_text_representation or numeric_value_out_of_range then
        raise exception using
          errcode = 'P0001',
          message = 'Invalid book or quantity.';
    end;

    if requested_book_id is null or requested_quantity is null then
      raise exception using
        errcode = 'P0001',
        message = 'Invalid book or quantity.';
    end if;

    if requested_book_id = any(seen_book_ids) then
      raise exception using
        errcode = 'P0001',
        message = 'Duplicate books are not allowed.';
    end if;
    seen_book_ids := array_append(seen_book_ids, requested_book_id);

    if requested_quantity < 1 or requested_quantity > 20 then
      raise exception using
        errcode = 'P0001',
        message = 'Invalid book quantity.';
    end if;

    select *
    into selected_book
    from public.books
    where id = requested_book_id and is_active
    for update;

    if not found then
      raise exception using
        errcode = 'P0001',
        message = 'One or more books are no longer available.';
    end if;

    if selected_book.stock < requested_quantity then
      raise exception using
        errcode = 'P0001',
        message = format(
          'Only %s copies of %s are available.',
          selected_book.stock,
          selected_book.name
        );
    end if;

    unit_price := coalesce(
      selected_book.discount_price,
      selected_book.regular_price
    );
    calculated_subtotal :=
      calculated_subtotal + round(unit_price * requested_quantity, 2);
  end loop;

  if requested_coupon_code is not null then
    select *
    into selected_coupon
    from public.coupons
    where code = requested_coupon_code and is_active
    for update;

    if not found then
      raise exception using
        errcode = 'P0001',
        message = 'This coupon is not valid.';
    end if;

    if selected_coupon.expires_at is not null
       and selected_coupon.expires_at < now() then
      raise exception using
        errcode = 'P0001',
        message = 'This coupon has expired.';
    end if;

    if selected_coupon.max_usage is not null
       and selected_coupon.usage_count >= selected_coupon.max_usage then
      raise exception using
        errcode = 'P0001',
        message = 'This coupon has reached its usage limit.';
    end if;

    if calculated_subtotal < selected_coupon.minimum_purchase then
      raise exception using
        errcode = 'P0001',
        message = format(
          'Minimum purchase of %s is required.',
          selected_coupon.minimum_purchase
        );
    end if;

    calculated_discount := case selected_coupon.discount_type
      when 'fixed' then selected_coupon.discount_value
      else round(
        calculated_subtotal * selected_coupon.discount_value / 100,
        0
      )
    end;
    calculated_discount := least(
      calculated_discount,
      calculated_subtotal
    );
  end if;

  calculated_total :=
    calculated_subtotal - calculated_discount + calculated_delivery;

  insert into public.orders (
    order_number,
    public_token,
    customer_name,
    phone,
    email,
    district,
    area,
    address,
    notes,
    delivery_zone,
    subtotal,
    coupon_id,
    coupon_code,
    discount,
    delivery_charge,
    grand_total,
    payment_method,
    payment_status,
    transaction_id
  )
  values (
    generated_order_number,
    generated_public_token,
    btrim(order_input ->> 'customer_name'),
    btrim(order_input ->> 'phone'),
    btrim(order_input ->> 'email'),
    btrim(order_input ->> 'district'),
    btrim(order_input ->> 'area'),
    btrim(order_input ->> 'address'),
    nullif(btrim(order_input ->> 'notes'), ''),
    requested_delivery_zone,
    calculated_subtotal,
    selected_coupon.id,
    selected_coupon.code,
    calculated_discount,
    calculated_delivery,
    calculated_total,
    requested_payment_method,
    case requested_payment_method
      when 'cash_on_delivery'
        then 'delivery_charge_submitted'::public.payment_status
      else 'pending'::public.payment_status
    end,
    requested_transaction_id
  )
  returning id into created_order_id;

  for item in
    select value from jsonb_array_elements(order_input -> 'items')
  loop
    requested_book_id := (item ->> 'book_id')::uuid;
    requested_quantity := (item ->> 'quantity')::integer;

    select *
    into selected_book
    from public.books
    where id = requested_book_id;

    unit_price := coalesce(
      selected_book.discount_price,
      selected_book.regular_price
    );

    insert into public.order_items (
      order_id,
      book_id,
      book_name,
      quantity,
      unit_price,
      line_total
    )
    values (
      created_order_id,
      selected_book.id,
      selected_book.name,
      requested_quantity,
      unit_price,
      round(unit_price * requested_quantity, 2)
    );
  end loop;

  if selected_coupon.id is not null then
    update public.coupons
    set usage_count = usage_count + 1
    where id = selected_coupon.id;
  end if;

  return query
  select generated_order_number, generated_public_token;
end;
$$;

revoke all on function public.create_store_order(jsonb, text, uuid)
from public, anon, authenticated;
grant execute on function public.create_store_order(jsonb, text, uuid)
to service_role;

notify pgrst, 'reload schema';
