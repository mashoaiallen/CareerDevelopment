-- Private workspace JSON, isolated by the signed-in Supabase Auth user.
create table if not exists public.workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
revoke all on table public.workspaces from anon, authenticated;
grant select, insert, update, delete on table public.workspaces to authenticated;

drop policy if exists "Users can read their workspace" on public.workspaces;
create policy "Users can read their workspace"
  on public.workspaces for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their workspace" on public.workspaces;
create policy "Users can create their workspace"
  on public.workspaces for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their workspace" on public.workspaces;
create policy "Users can update their workspace"
  on public.workspaces for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their workspace" on public.workspaces;
create policy "Users can delete their workspace"
  on public.workspaces for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Evidence uses a private bucket. The first folder in every object path is the user's Auth UUID.
insert into storage.buckets (id, name, public, file_size_limit)
values ('portfolio-evidence', 'portfolio-evidence', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = 20971520;

grant select, insert, update, delete on table storage.objects to authenticated;

drop policy if exists "Users can read their evidence files" on storage.objects;
create policy "Users can read their evidence files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can upload their evidence files" on storage.objects;
create policy "Users can upload their evidence files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update their evidence files" on storage.objects;
create policy "Users can update their evidence files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their evidence files" on storage.objects;
create policy "Users can delete their evidence files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
