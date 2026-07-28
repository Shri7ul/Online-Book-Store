alter table public.orders
add column if not exists public_token uuid;

update public.orders
set public_token = extensions.gen_random_uuid()
where public_token is null;

alter table public.orders
alter column public_token set default extensions.gen_random_uuid();

alter table public.orders
alter column public_token set not null;

create unique index if not exists orders_public_token_key
on public.orders(public_token);

create index if not exists orders_public_tracking_idx
on public.orders(order_number, public_token);

notify pgrst, 'reload schema';
