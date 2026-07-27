create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

create type public.discount_type as enum ('fixed', 'percentage');
create type public.preview_type as enum ('image', 'pdf');
create type public.delivery_zone as enum ('inside_dhaka', 'outside_dhaka');
create type public.payment_method as enum ('cash_on_delivery', 'online');
create type public.order_status as enum (
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
);
create type public.payment_status as enum (
  'pending',
  'delivery_charge_submitted',
  'paid',
  'failed',
  'refunded'
);

create table public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin', 'manager')),
  display_name text,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'bn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint category_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.writers (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null unique,
  biography text,
  photo_url text,
  photo_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint writer_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.books (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null unique,
  writer_id uuid references public.writers(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  publisher text,
  isbn text unique,
  language text not null default 'English',
  pages integer check (pages is null or pages > 0),
  edition text,
  stock integer not null default 0 check (stock >= 0),
  description text not null default '',
  regular_price numeric(12,2) not null check (regular_price >= 0),
  discount_price numeric(12,2),
  cover_url text,
  cover_path text,
  featured boolean not null default false,
  trending boolean not null default false,
  new_arrival boolean not null default false,
  best_seller boolean not null default false,
  is_active boolean not null default true,
  view_count bigint not null default 0 check (view_count >= 0),
  sold_count bigint not null default 0 check (sold_count >= 0),
  seo_title text,
  seo_description text,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint book_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint valid_discount check (
    discount_price is null or
    (discount_price >= 0 and discount_price < regular_price)
  )
);

create table public.book_images (
  id uuid primary key default extensions.gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  url text not null,
  storage_path text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.book_previews (
  id uuid primary key default extensions.gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  type public.preview_type not null,
  url text,
  storage_path text not null,
  page_number integer check (page_number is null or page_number > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.hero_banners (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  subtitle text,
  button_text text,
  button_url text,
  image_url text not null,
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_banner_window check (
    starts_at is null or ends_at is null or starts_at < ends_at
  )
);

create table public.coupons (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  discount_type public.discount_type not null,
  discount_value numeric(12,2) not null check (discount_value > 0),
  minimum_purchase numeric(12,2) not null default 0 check (minimum_purchase >= 0),
  expires_at timestamptz,
  max_usage integer check (max_usage is null or max_usage > 0),
  max_usage_per_user integer check (
    max_usage_per_user is null or max_usage_per_user > 0
  ),
  usage_count integer not null default 0 check (usage_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupon_code_format check (code = upper(code)),
  constraint percentage_limit check (
    discount_type <> 'percentage' or discount_value <= 100
  )
);

create table public.orders (
  id uuid primary key default extensions.gen_random_uuid(),
  order_number text not null unique,
  public_token uuid not null default extensions.gen_random_uuid() unique,
  user_id uuid references public.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text not null,
  district text not null,
  area text not null,
  address text not null,
  notes text,
  delivery_zone public.delivery_zone not null,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  coupon_id uuid references public.coupons(id) on delete set null,
  coupon_code text,
  discount numeric(12,2) not null default 0 check (discount >= 0),
  delivery_charge numeric(12,2) not null check (delivery_charge >= 0),
  grand_total numeric(12,2) not null check (grand_total >= 0),
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  transaction_id text,
  status public.order_status not null default 'pending',
  confirmed_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_order_total check (
    grand_total = subtotal - discount + delivery_charge
  )
);

create table public.order_items (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  book_name text not null,
  quantity integer not null check (quantity > 0 and quantity <= 20),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now(),
  constraint valid_line_total check (line_total = unit_price * quantity)
);

create table public.order_status_events (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.settings (
  id boolean primary key default true check (id),
  store_name text not null default 'Mini Book Cottage',
  logo_url text,
  logo_path text,
  favicon_url text,
  favicon_path text,
  phone text not null default '',
  whatsapp text,
  facebook_url text,
  messenger_url text,
  instagram_url text,
  support_email text not null default '',
  support_phone text not null default '',
  address text not null default '',
  delivery_inside_dhaka numeric(12,2) not null default 80 check (delivery_inside_dhaka >= 0),
  delivery_outside_dhaka numeric(12,2) not null default 120 check (delivery_outside_dhaka >= 0),
  payment_number text not null default '',
  payment_instruction text not null default '',
  homepage_title text not null default 'Books worth keeping.',
  homepage_subtitle text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  footer_text text not null default '',
  copyright text not null default '',
  confirmation_message text not null default '',
  google_analytics_id text,
  meta_pixel_id text,
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlists (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table public.newsletter_subscribers (
  id uuid primary key default extensions.gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table public.contact_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  session_id text,
  event_name text not null,
  path text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index books_writer_id_idx on public.books(writer_id);
create index books_category_id_idx on public.books(category_id);
create index books_active_created_idx on public.books(is_active, created_at desc);
create index books_flags_idx on public.books(featured, trending, new_arrival, best_seller)
  where is_active;
create index books_price_idx on public.books(regular_price, discount_price)
  where is_active;
create index books_popularity_idx on public.books(sold_count desc, view_count desc)
  where is_active;
create index books_search_vector_idx on public.books using gin(search_vector);
create index books_name_trgm_idx on public.books using gin(name extensions.gin_trgm_ops);
create index books_publisher_trgm_idx on public.books using gin(publisher extensions.gin_trgm_ops);
create index writers_name_trgm_idx on public.writers using gin(name extensions.gin_trgm_ops);
create index categories_name_trgm_idx on public.categories using gin(name extensions.gin_trgm_ops);
create index book_images_book_sort_idx on public.book_images(book_id, sort_order);
create index book_previews_book_sort_idx on public.book_previews(book_id, sort_order);
create index hero_banners_active_sort_idx on public.hero_banners(is_active, sort_order);
create index coupons_lookup_idx on public.coupons(code, is_active, expires_at);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index orders_phone_idx on public.orders(phone);
create index orders_email_idx on public.orders(email);
create index orders_public_tracking_idx on public.orders(order_number, public_token);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_book_idx on public.order_items(book_id);
create index order_events_order_created_idx on public.order_status_events(order_id, created_at);
create index reviews_book_approved_idx on public.reviews(book_id, is_approved, created_at desc);
create index analytics_events_created_idx on public.analytics_events(created_at desc);
create index analytics_events_name_created_idx on public.analytics_events(event_name, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on public.users
for each row execute function public.set_updated_at();
create trigger categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger writers_updated_at before update on public.writers
for each row execute function public.set_updated_at();
create trigger books_updated_at before update on public.books
for each row execute function public.set_updated_at();
create trigger banners_updated_at before update on public.hero_banners
for each row execute function public.set_updated_at();
create trigger coupons_updated_at before update on public.coupons
for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.settings
for each row execute function public.set_updated_at();
create trigger reviews_updated_at before update on public.reviews
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where id = (select auth.uid())
  );
$$;

create or replace function public.claim_initial_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if exists (select 1 from public.admins) then
    return exists (
      select 1 from public.admins where id = (select auth.uid())
    );
  end if;

  insert into public.admins (id, role, display_name)
  select
    u.id,
    'owner',
    coalesce(u.raw_user_meta_data ->> 'full_name', u.email)
  from auth.users u
  where u.id = (select auth.uid())
  on conflict (id) do nothing;

  return true;
end;
$$;

create or replace function public.refresh_book_search_vector()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  writer_name text := '';
  category_name text := '';
begin
  if new.writer_id is not null then
    select w.name into writer_name
    from public.writers w
    where w.id = new.writer_id;
  end if;
  if new.category_id is not null then
    select c.name into category_name
    from public.categories c
    where c.id = new.category_id;
  end if;

  new.search_vector :=
    setweight(to_tsvector('simple', extensions.unaccent(coalesce(new.name, ''))), 'A') ||
    setweight(to_tsvector('simple', extensions.unaccent(coalesce(writer_name, ''))), 'A') ||
    setweight(to_tsvector('simple', extensions.unaccent(coalesce(category_name, ''))), 'B') ||
    setweight(to_tsvector('simple', extensions.unaccent(coalesce(new.publisher, ''))), 'B') ||
    setweight(to_tsvector('simple', extensions.unaccent(coalesce(new.description, ''))), 'C');
  return new;
end;
$$;

create trigger books_search_vector_trigger
before insert or update of name, writer_id, category_id, publisher, description
on public.books
for each row execute function public.refresh_book_search_vector();

create or replace function public.refresh_related_book_search_vectors()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'writers' then
    update public.books set writer_id = writer_id where writer_id = new.id;
  elsif tg_table_name = 'categories' then
    update public.books set category_id = category_id where category_id = new.id;
  end if;
  return new;
end;
$$;

create trigger writer_search_refresh
after update of name on public.writers
for each row execute function public.refresh_related_book_search_vectors();
create trigger category_search_refresh
after update of name on public.categories
for each row execute function public.refresh_related_book_search_vectors();

create or replace function public.search_books(
  search_term text,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  id uuid,
  name text,
  slug text,
  writer_id uuid,
  category_id uuid,
  writer jsonb,
  category jsonb,
  publisher text,
  isbn text,
  language text,
  pages integer,
  edition text,
  stock integer,
  description text,
  regular_price numeric,
  discount_price numeric,
  cover_url text,
  featured boolean,
  trending boolean,
  new_arrival boolean,
  best_seller boolean,
  is_active boolean,
  view_count bigint,
  sold_count bigint,
  seo_title text,
  seo_description text,
  created_at timestamptz,
  rating numeric,
  review_count bigint,
  total_count bigint
)
language sql
stable
set search_path = ''
as $$
  with ranked as (
    select
      b.*,
      jsonb_build_object(
        'id', w.id, 'name', w.name, 'slug', w.slug, 'photo_url', w.photo_url
      ) as writer_json,
      jsonb_build_object(
        'id', c.id, 'name', c.name, 'slug', c.slug
      ) as category_json,
      greatest(
        ts_rank_cd(b.search_vector, websearch_to_tsquery('simple', extensions.unaccent(search_term))),
        extensions.similarity(extensions.unaccent(b.name), extensions.unaccent(search_term)),
        extensions.similarity(extensions.unaccent(coalesce(w.name, '')), extensions.unaccent(search_term)) * 0.85,
        extensions.similarity(extensions.unaccent(coalesce(c.name, '')), extensions.unaccent(search_term)) * 0.7,
        extensions.similarity(extensions.unaccent(coalesce(b.publisher, '')), extensions.unaccent(search_term)) * 0.65
      ) as score,
      coalesce(avg(r.rating) filter (where r.is_approved), 0) as avg_rating,
      count(r.id) filter (where r.is_approved) as reviews
    from public.books b
    left join public.writers w on w.id = b.writer_id
    left join public.categories c on c.id = b.category_id
    left join public.reviews r on r.book_id = b.id
    where
      b.is_active
      and (
        b.search_vector @@ websearch_to_tsquery('simple', extensions.unaccent(search_term))
        or extensions.similarity(extensions.unaccent(b.name), extensions.unaccent(search_term)) > 0.18
        or extensions.similarity(extensions.unaccent(coalesce(w.name, '')), extensions.unaccent(search_term)) > 0.18
        or extensions.similarity(extensions.unaccent(coalesce(c.name, '')), extensions.unaccent(search_term)) > 0.18
        or extensions.similarity(extensions.unaccent(coalesce(b.publisher, '')), extensions.unaccent(search_term)) > 0.18
      )
    group by b.id, w.id, c.id
  )
  select
    r.id, r.name, r.slug, r.writer_id, r.category_id,
    r.writer_json, r.category_json, r.publisher, r.isbn, r.language,
    r.pages, r.edition, r.stock, r.description, r.regular_price,
    r.discount_price, r.cover_url, r.featured, r.trending, r.new_arrival,
    r.best_seller, r.is_active, r.view_count, r.sold_count, r.seo_title,
    r.seo_description, r.created_at, round(r.avg_rating, 1),
    r.reviews, count(*) over()
  from ranked r
  where r.score > 0
  order by r.score desc, r.sold_count desc
  limit least(greatest(result_limit, 1), 100)
  offset greatest(result_offset, 0);
$$;

create or replace function public.record_initial_order_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.order_status_events(order_id, status, note)
  values (new.id, new.status, 'Order received');
  return new;
end;
$$;

create trigger order_initial_status
after insert on public.orders
for each row execute function public.record_initial_order_status();

create or replace function public.admin_update_order_status(
  target_order_id uuid,
  next_status public.order_status,
  status_note text default null
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_order public.orders;
  result_order public.orders;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select * into current_order
  from public.orders
  where id = target_order_id
  for update;

  if not found then raise exception 'Order not found'; end if;

  if current_order.status = 'pending' and next_status = 'confirmed' then
    if exists (
      select 1
      from public.order_items oi
      join public.books b on b.id = oi.book_id
      where oi.order_id = target_order_id and b.stock < oi.quantity
    ) then
      raise exception 'Insufficient stock for one or more books';
    end if;

    update public.books b
    set
      stock = b.stock - oi.quantity,
      sold_count = b.sold_count + oi.quantity
    from public.order_items oi
    where oi.order_id = target_order_id and oi.book_id = b.id;
  end if;

  if current_order.status in ('confirmed', 'packed', 'shipped')
     and next_status = 'cancelled' then
    update public.books b
    set
      stock = b.stock + oi.quantity,
      sold_count = greatest(0, b.sold_count - oi.quantity)
    from public.order_items oi
    where oi.order_id = target_order_id and oi.book_id = b.id;
  end if;

  update public.orders
  set
    status = next_status,
    confirmed_at = case
      when next_status = 'confirmed' and confirmed_at is null then now()
      else confirmed_at
    end,
    delivered_at = case
      when next_status = 'delivered' then now()
      else delivered_at
    end
  where id = target_order_id
  returning * into result_order;

  insert into public.order_status_events(order_id, status, note, changed_by)
  values (target_order_id, next_status, status_note, (select auth.uid()));

  return result_order;
end;
$$;

alter table public.admins enable row level security;
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.writers enable row level security;
alter table public.books enable row level security;
alter table public.book_images enable row level security;
alter table public.book_previews enable row level security;
alter table public.hero_banners enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_events enable row level security;
alter table public.settings enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.analytics_events enable row level security;

create policy "admins can read admins" on public.admins
for select using (public.is_admin());
create policy "users read own profile" on public.users
for select using ((select auth.uid()) = id or public.is_admin());
create policy "users update own profile" on public.users
for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "public reads active categories" on public.categories
for select using (is_active or public.is_admin());
create policy "public reads active writers" on public.writers
for select using (is_active or public.is_admin());
create policy "public reads active books" on public.books
for select using (is_active or public.is_admin());
create policy "public reads book images" on public.book_images
for select using (
  exists (
    select 1 from public.books
    where books.id = book_images.book_id and (books.is_active or public.is_admin())
  )
);
create policy "public reads preview metadata" on public.book_previews
for select using (
  exists (
    select 1 from public.books
    where books.id = book_previews.book_id and (books.is_active or public.is_admin())
  )
);
create policy "public reads active banners" on public.hero_banners
for select using (
  public.is_admin() or (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  )
);
create policy "admins read coupons" on public.coupons
for select using (public.is_admin());
create policy "public reads settings" on public.settings
for select using (true);
create policy "public reads approved reviews" on public.reviews
for select using (is_approved or public.is_admin());
create policy "authenticated users create reviews" on public.reviews
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users manage own wishlist" on public.wishlists
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "users read own orders" on public.orders
for select to authenticated
using ((select auth.uid()) = user_id or public.is_admin());
create policy "users read own order items" on public.order_items
for select to authenticated
using (
  public.is_admin() or exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  )
);
create policy "users read own order events" on public.order_status_events
for select to authenticated
using (
  public.is_admin() or exists (
    select 1 from public.orders
    where orders.id = order_status_events.order_id
      and orders.user_id = (select auth.uid())
  )
);
create policy "public subscribes to newsletter" on public.newsletter_subscribers
for insert to anon, authenticated with check (true);
create policy "public sends contact messages" on public.contact_messages
for insert to anon, authenticated with check (true);
create policy "public records analytics" on public.analytics_events
for insert to anon, authenticated with check (true);

create policy "admins manage categories" on public.categories
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage writers" on public.writers
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage books" on public.books
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage book images" on public.book_images
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage book previews" on public.book_previews
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage banners" on public.hero_banners
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage coupons" on public.coupons
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage orders" on public.orders
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage order items" on public.order_items
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage order events" on public.order_status_events
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage settings" on public.settings
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage reviews" on public.reviews
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage newsletter" on public.newsletter_subscribers
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage messages" on public.contact_messages
for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read analytics" on public.analytics_events
for select using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('book-covers', 'book-covers', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('book-gallery', 'book-gallery', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('book-preview', 'book-preview', false, 26214400, array['application/pdf','image/jpeg','image/png','image/webp']),
  ('hero-banners', 'hero-banners', true, 15728640, array['image/jpeg','image/png','image/webp','image/avif']),
  ('writer-images', 'writer-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('category-images', 'category-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('site-assets', 'site-assets', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads public store assets" on storage.objects
for select using (
  bucket_id in (
    'book-covers', 'book-gallery', 'hero-banners',
    'writer-images', 'category-images', 'site-assets'
  )
);
create policy "admins read private previews" on storage.objects
for select to authenticated using (
  bucket_id = 'book-preview' and public.is_admin()
);
create policy "admins upload store assets" on storage.objects
for insert to authenticated with check (
  public.is_admin() and bucket_id in (
    'book-covers', 'book-gallery', 'book-preview', 'hero-banners',
    'writer-images', 'category-images', 'site-assets'
  )
);
create policy "admins update store assets" on storage.objects
for update to authenticated using (public.is_admin())
with check (public.is_admin());
create policy "admins delete store assets" on storage.objects
for delete to authenticated using (public.is_admin());

grant execute on function public.claim_initial_admin() to authenticated;
grant execute on function public.search_books(text, integer, integer) to anon, authenticated;
grant execute on function public.admin_update_order_status(uuid, public.order_status, text) to authenticated;

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_status_events;
