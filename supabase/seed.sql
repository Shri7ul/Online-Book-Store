insert into public.settings (
  id, store_name, phone, whatsapp, facebook_url, messenger_url, instagram_url,
  support_email, support_phone, address, delivery_inside_dhaka,
  delivery_outside_dhaka, payment_number, payment_instruction, homepage_title,
  homepage_subtitle, seo_title, seo_description, footer_text, copyright,
  confirmation_message
) values (
  true,
  'Mini Book Cottage',
  '+880 1700-000000',
  '+880 1700-000000',
  'https://facebook.com/minibookcottage',
  'https://m.me/minibookcottage',
  'https://instagram.com/minibookcottage',
  'hello@minibookcottage.com',
  '+880 1700-000000',
  'Dhaka, Bangladesh',
  80,
  120,
  '01700-000000',
  'Send only the delivery charge via bKash, Nagad, or Rocket to confirm your order.',
  'Books worth keeping.',
  'A thoughtful online bookstore for curious readers across Bangladesh.',
  'Mini Book Cottage — Books worth keeping',
  'Shop carefully selected books with delivery across Bangladesh.',
  'A small, thoughtful bookstore for readers who choose with care.',
  '© 2026 Mini Book Cottage. All rights reserved.',
  'Our team usually confirms orders within 12 hours. If you are not contacted within 12 hours, please contact us through our Facebook Page or phone number.'
) on conflict (id) do update set store_name = excluded.store_name;

insert into public.categories (name, slug, description, image_url, sort_order)
values
  ('Fiction', 'fiction', 'Stories that stay with you.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80', 1),
  ('Self Development', 'self-development', 'Clear ideas for a better life.', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80', 2),
  ('Business', 'business', 'Strategy, leadership, and modern work.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80', 3),
  ('Children', 'children', 'Bright books for curious young minds.', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80', 4),
  ('History', 'history', 'The people and events that shaped us.', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=900&q=80', 5),
  ('Religion', 'religion', 'Faith, reflection, and spiritual growth.', 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=900&q=80', 6),
  ('Science', 'science', 'Big questions, beautifully explained.', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80', 7),
  ('Bangla Literature', 'bangla-literature', 'Essential voices from Bangladesh.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80', 8)
on conflict (slug) do nothing;

insert into public.writers (name, slug, biography, photo_url)
values
  ('Aminul Hoque', 'aminul-hoque', 'Essayist and thoughtful observer of modern life.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80'),
  ('Nadia Rahman', 'nadia-rahman', 'Award-winning novelist writing about memory and belonging.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80'),
  ('Farhan Kabir', 'farhan-kabir', 'Entrepreneur and author focused on practical leadership.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80'),
  ('Samira Ahmed', 'samira-ahmed', 'Children''s author and advocate for joyful learning.', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80'),
  ('Rezaul Karim', 'rezaul-karim', 'Historian documenting the stories of Bengal.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80'),
  ('Mariam Sultana', 'mariam-sultana', 'Writer on faith, family, and intentional living.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'),
  ('Tanvir Hasan', 'tanvir-hasan', 'Science communicator making complex ideas accessible.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80'),
  ('Anika Chowdhury', 'anika-chowdhury', 'Contemporary fiction writer based in Dhaka.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80'),
  ('Rafiq Azad', 'rafiq-azad', 'Poet and translator of modern Bengali literature.', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=500&q=80'),
  ('Sara Mahmud', 'sara-mahmud', 'Psychologist and writer on resilience and wellbeing.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80'),
  ('Imran Hossain', 'imran-hossain', 'Researcher exploring cities, culture, and technology.', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=500&q=80'),
  ('Lamia Noor', 'lamia-noor', 'Illustrator and author of imaginative books for children.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80')
on conflict (slug) do nothing;

with source(title, writer_slug, category_slug, price, discount, cover, featured, trending, new_arrival, best_seller) as (
  values
    ('The Quiet Architecture of Life','aminul-hoque','self-development',520,420,'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=85',true,false,false,false),
    ('A River Remembers','nadia-rahman','fiction',480,390,'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=85',true,false,false,false),
    ('Small Decisions, Remarkable Days','sara-mahmud','self-development',560,450,'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=700&q=85',true,false,false,false),
    ('The Last Tea House','anika-chowdhury','fiction',440,null,'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=85',true,false,false,false),
    ('Building What Matters','farhan-kabir','business',680,540,'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=85',true,false,false,false),
    ('Mina and the Moon Garden','lamia-noor','children',380,320,'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=85',true,false,false,false),
    ('A Brief History of Bengal','rezaul-karim','history',720,590,'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=85',true,true,false,false),
    ('Letters to the Restless Heart','mariam-sultana','religion',420,null,'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=700&q=85',true,true,false,false),
    ('The Curious Universe','tanvir-hasan','science',620,490,'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=85',false,true,false,false),
    ('Dhaka After Rain','anika-chowdhury','fiction',460,380,'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=85',false,true,false,false),
    ('The Craft of Clear Thinking','aminul-hoque','self-development',590,null,'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=700&q=85',false,true,false,false),
    ('Where the Kites Return','nadia-rahman','fiction',490,410,'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=85',false,true,false,false),
    ('A Practical Guide to Deep Work','sara-mahmud','self-development',650,510,'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=85',false,true,false,false),
    ('The Mango Tree Mystery','samira-ahmed','children',350,null,'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=85',false,true,false,false),
    ('Maps of Forgotten Roads','rezaul-karim','history',740,610,'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=85',false,false,true,false),
    ('The Grace of Ordinary Things','mariam-sultana','religion',430,350,'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=700&q=85',false,false,true,false),
    ('Science at the Breakfast Table','tanvir-hasan','science',540,null,'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=85',false,false,true,false),
    ('The City of Paper Birds','anika-chowdhury','fiction',470,390,'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=85',false,false,true,false),
    ('The Long View','farhan-kabir','business',690,560,'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=700&q=85',false,false,true,false),
    ('Stories from Sonargaon','rafiq-azad','bangla-literature',400,null,'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=85',false,false,true,false),
    ('Kindness Is a Superpower','lamia-noor','children',320,270,'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=85',false,false,true,false),
    ('Notes on Starting Again','sara-mahmud','self-development',510,420,'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=85',false,false,true,false),
    ('The Honest Company','farhan-kabir','business',730,null,'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=85',false,false,false,true),
    ('Rumi''s Red Umbrella','samira-ahmed','children',360,290,'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=700&q=85',false,false,false,true),
    ('The Monsoon Archive','nadia-rahman','fiction',520,430,'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=85',false,false,false,true),
    ('A Home for the Soul','mariam-sultana','religion',450,null,'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=85',false,false,false,true),
    ('How Stars Learn to Shine','tanvir-hasan','science',580,470,'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=700&q=85',false,false,false,true),
    ('Window Seat to Chattogram','anika-chowdhury','fiction',480,390,'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=85',false,false,false,true),
    ('Good Questions, Better Work','aminul-hoque','business',620,null,'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=85',false,false,false,true),
    ('The Blue Bicycle Club','lamia-noor','children',340,280,'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=85',false,false,false,true),
    ('Bengal: A People''s Story','rezaul-karim','history',760,620,'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=85',false,false,false,false),
    ('Daily Light','mariam-sultana','religion',390,null,'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=700&q=85',false,false,false,false),
    ('The Physics of Almost Everything','tanvir-hasan','science',670,550,'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=700&q=85',false,false,false,false),
    ('A Thousand Little Windows','nadia-rahman','fiction',490,410,'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=85',false,false,false,false),
    ('Leading Without Noise','farhan-kabir','business',710,null,'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=700&q=85',false,false,false,false),
    ('The Library Under the Stairs','samira-ahmed','children',370,310,'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=85',false,false,false,false),
    ('1971: Voices of Courage','rezaul-karim','history',790,650,'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=85',false,false,false,false),
    ('The Mindful Believer','mariam-sultana','religion',460,null,'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=85',false,false,false,false),
    ('Future Cities of Bangladesh','imran-hossain','science',680,560,'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=85',false,false,false,false),
    ('Poems for a Tender Country','rafiq-azad','bangla-literature',380,320,'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=700&q=85',false,false,false,false)
)
insert into public.books (
  name, slug, writer_id, category_id, publisher, isbn, language, pages,
  edition, stock, description, regular_price, discount_price, cover_url,
  featured, trending, new_arrival, best_seller, view_count, sold_count,
  seo_title, seo_description, created_at
)
select
  s.title,
  trim(both '-' from regexp_replace(lower(s.title), '[^a-z0-9]+', '-', 'g')),
  w.id,
  c.id,
  case when row_number() over () % 2 = 0 then 'Cottage Press' else 'North Star Publications' end,
  '978984' || lpad((1000000 + row_number() over ())::text, 7, '0'),
  case when row_number() over () % 9 = 0 then 'Bangla' else 'English' end,
  176 + ((row_number() over () % 8) * 24),
  'First Edition',
  8 + (row_number() over () % 17),
  'A carefully written, beautifully produced book for readers who value enduring ideas and memorable stories. This edition includes thoughtful notes and a reader-friendly layout.',
  s.price,
  s.discount,
  s.cover,
  s.featured,
  s.trending,
  s.new_arrival,
  s.best_seller,
  150 + row_number() over () * 31,
  25 + row_number() over () * 7,
  s.title,
  'Buy ' || s.title || ' online from Mini Book Cottage.',
  now() - (row_number() over () || ' days')::interval
from source s
join public.writers w on w.slug = s.writer_slug
join public.categories c on c.slug = s.category_slug
on conflict (slug) do nothing;

insert into public.hero_banners (
  title, subtitle, button_text, button_url, image_url, sort_order
) values
  ('A quieter way to find your next book.','Thoughtful editions, honest prices, and delivery anywhere in Bangladesh.','Explore the collection','/shop','https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1800&q=88',1),
  ('Fresh stories for unhurried evenings.','Discover this month''s most talked-about fiction.','Shop new fiction','/category/fiction','https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1800&q=88',2),
  ('Big imagination. Small readers.','Beautiful books chosen for curious young minds.','Browse children''s books','/category/children','https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=1800&q=88',3),
  ('Ideas for work that matters.','Practical business and leadership books, without the noise.','View business books','/category/business','https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1800&q=88',4),
  ('Read more. Spend thoughtfully.','Selected editions with meaningful savings.','See current offers','/shop?discount=true','https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=1800&q=88',5),
  ('Essential voices from Bangladesh.','Poetry, history, and stories rooted close to home.','Explore Bangla literature','/category/bangla-literature','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1800&q=88',6);

insert into public.coupons (
  code, discount_type, discount_value, minimum_purchase, expires_at,
  max_usage, max_usage_per_user
) values
  ('LEON10','fixed',100,500,'2027-12-31 23:59:59+06',500,1),
  ('READ15','percentage',15,800,'2027-12-31 23:59:59+06',300,1),
  ('COTTAGE50','fixed',50,350,'2027-12-31 23:59:59+06',1000,2),
  ('NEWREADER','percentage',10,400,'2027-12-31 23:59:59+06',500,1),
  ('FICTION100','fixed',100,700,'2027-12-31 23:59:59+06',200,1),
  ('BOOKWEEK','percentage',12,600,'2027-12-31 23:59:59+06',250,1),
  ('DHAKA80','fixed',80,1000,'2027-12-31 23:59:59+06',400,1),
  ('STUDY20','percentage',20,1200,'2027-12-31 23:59:59+06',100,1),
  ('HELLO75','fixed',75,450,'2027-12-31 23:59:59+06',350,1),
  ('SHELF10','percentage',10,500,'2027-12-31 23:59:59+06',600,2)
on conflict (code) do nothing;

insert into public.book_images (book_id, url, alt_text, sort_order)
select
  b.id,
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=85',
  b.name || ' inside pages',
  1
from public.books b
where not exists (
  select 1 from public.book_images bi where bi.book_id = b.id
);

insert into public.book_previews (
  book_id, type, url, storage_path, page_number, sort_order
)
select
  b.id,
  'image',
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=1200&q=85',
  'demo/' || b.id || '/page-1.jpg',
  1,
  1
from public.books b
where not exists (
  select 1 from public.book_previews bp where bp.book_id = b.id
);

insert into public.reviews (
  book_id, reviewer_name, rating, title, body, is_approved
)
select
  b.id,
  names.name,
  4 + (row_number() over () % 2),
  'A thoughtful edition',
  'Beautifully produced, carefully packed, and exactly as described.',
  true
from (
  select id from public.books order by created_at desc limit 12
) b
cross join lateral (
  select (array['Nusrat Jahan','Mahin Islam','Sadia Karim','Fariha Ahmed'])[
    1 + (abs(hashtext(b.id::text)) % 4)
  ] as name
) names;

with created_orders as (
  insert into public.orders (
    order_number, customer_name, phone, email, district, area, address,
    delivery_zone, subtotal, discount, delivery_charge, grand_total,
    payment_method, payment_status, transaction_id, status, created_at
  )
  select
    'MBC-DEMO-' || lpad(gs::text, 3, '0'),
    (array['Nusrat Jahan','Mahin Islam','Sadia Karim','Fariha Ahmed','Arif Hasan','Tamanna Noor','Saif Rahman','Rumana Akter'])[gs],
    '0170000000' || gs,
    'reader' || gs || '@example.com',
    case when gs % 2 = 0 then 'Chattogram' else 'Dhaka' end,
    case when gs % 2 = 0 then 'Panchlaish' else 'Dhanmondi' end,
    'Demo delivery address ' || gs,
    case when gs % 2 = 0 then 'outside_dhaka'::public.delivery_zone else 'inside_dhaka'::public.delivery_zone end,
    520 + gs * 80,
    case when gs % 3 = 0 then 50 else 0 end,
    case when gs % 2 = 0 then 120 else 80 end,
    520 + gs * 80 - case when gs % 3 = 0 then 50 else 0 end + case when gs % 2 = 0 then 120 else 80 end,
    'cash_on_delivery',
    'delivery_charge_submitted',
    'DEMO-TXN-' || gs,
    (array['pending','confirmed','packed','shipped','delivered','pending','confirmed','delivered']::public.order_status[])[gs],
    now() - (gs || ' days')::interval
  from generate_series(1, 8) gs
  on conflict (order_number) do nothing
  returning id, order_number, subtotal
)
insert into public.order_items (
  order_id, book_id, book_name, quantity, unit_price, line_total
)
select
  o.id,
  b.id,
  b.name,
  1,
  o.subtotal,
  o.subtotal
from created_orders o
cross join lateral (
  select id, name
  from public.books
  order by md5(id::text || o.id::text)
  limit 1
) b;
