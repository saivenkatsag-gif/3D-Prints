-- Admin access. Run after products.sql and storage.sql.
create table if not exists admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table admins enable row level security;
create policy "read own admin row" on admins for select to authenticated using (user_id = auth.uid());

create or replace function is_admin() returns boolean
language sql security definer set search_path = public stable
as $$ select exists (select 1 from admins where user_id = auth.uid()) $$;

do $$
declare t text;
begin
  foreach t in array array['categories','products','product_categories'] loop
    execute format('create policy "admin insert" on %I for insert to authenticated with check (is_admin())', t);
    execute format('create policy "admin update" on %I for update to authenticated using (is_admin()) with check (is_admin())', t);
    execute format('create policy "admin delete" on %I for delete to authenticated using (is_admin())', t);
  end loop;
end $$;

-- Bucket for product and category photos: public to read, admin only to write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and is_admin());
create policy "admin update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and is_admin());
create policy "admin delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and is_admin());

-- Make yourself an admin: first create your user in Supabase > Authentication > Users > Add user,
-- then run this with your email:
-- insert into admins (user_id) select id from auth.users where email = 'you@example.com';
