create table categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id) on delete set null,
  name text not null, slug text unique not null,
  description text, image_url text, sort_order int default 0
);
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, description text default '',
  price int not null, compare_at_price int,
  images text[] default '{}', dimensions text, material text,
  specs jsonb default '{}', in_stock boolean default true,
  production_days text, customisation jsonb default '{}',
  featured boolean default false, sales_count int default 0, created_at timestamptz default now()
);
create table product_categories (
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (product_id, category_id)
);
alter table categories enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
create policy "public read" on categories for select using (true);
create policy "public read" on products for select using (true);
create policy "public read" on product_categories for select using (true);
-- Admin writes: add policies for authenticated admins in the admin phase.

-- Example: a keychain asks for a name; a flexi dragon only asks for colour and size.
-- customisation: {"colours":[{"name":"Coral","hex":"#FF6B5E"}],"text":{"maxLength":12,"fonts":["Rounded","Block"],"colour":true},"notes":true}
-- customisation: {"colours":[{"name":"Blue","hex":"#4F7CFF","multi":true}],"sizes":[{"label":"Small","price":349},{"label":"Medium","price":399},{"label":"Large","price":499}]}
