-- Reference image uploads: anyone can upload one image (JPG/PNG/WEBP, 5 MB), nobody can overwrite or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reference-images', 'reference-images', true, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public can upload reference images"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'reference-images');

create policy "public can read reference images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'reference-images');
