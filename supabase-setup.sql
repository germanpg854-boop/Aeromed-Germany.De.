-- AeroMed public learning library setup
-- Run this script in Supabase SQL Editor before using documents.html/admin.html.
-- Uploaded files are public educational resources. Do not store private or sensitive files here.

create table if not exists public.aeromed_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.aeromed_admins enable row level security;
revoke all on public.aeromed_admins from anon, authenticated;
grant select on public.aeromed_admins to authenticated;

drop policy if exists "AeroMed admins can read their own row" on public.aeromed_admins;
create policy "AeroMed admins can read their own row"
on public.aeromed_admins for select to authenticated
using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'aeromed-documents',
  'aeromed-documents',
  true,
  26214400,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "AeroMed documents are publicly readable" on storage.objects;
create policy "AeroMed documents are publicly readable"
on storage.objects for select to anon, authenticated
using (bucket_id = 'aeromed-documents');

drop policy if exists "AeroMed admins can upload documents" on storage.objects;
create policy "AeroMed admins can upload documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'aeromed-documents'
  and exists (
    select 1 from public.aeromed_admins
    where user_id = (select auth.uid())
  )
);

drop policy if exists "AeroMed admins can remove documents" on storage.objects;
create policy "AeroMed admins can remove documents"
on storage.objects for delete to authenticated
using (
  bucket_id = 'aeromed-documents'
  and exists (
    select 1 from public.aeromed_admins
    where user_id = (select auth.uid())
  )
);

-- After creating your Auth user in Supabase, authorize it as the site admin:
-- insert into public.aeromed_admins (user_id) values ('PASTE_AUTH_USER_UUID_HERE');
