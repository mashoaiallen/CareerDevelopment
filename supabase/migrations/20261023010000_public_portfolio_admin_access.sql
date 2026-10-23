-- Public visitors can read a sanitized portfolio projection. Only Allen's account
-- can read or change the source workspace and evidence files.
create schema if not exists portfolio_private;
revoke all on schema portfolio_private from public, anon, authenticated;
grant usage on schema portfolio_private to authenticated;

create or replace function portfolio_private.is_administrator()
returns boolean
language sql
stable
set search_path = ''
as $$
  select lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'mashoaiallen@gmail.com'
    and (
      coalesce((select auth.jwt() -> 'app_metadata' ->> 'provider'), '') = 'google'
      or coalesce((select auth.jwt() -> 'app_metadata' -> 'providers'), '[]'::jsonb) ? 'google'
    );
$$;
revoke all on function portfolio_private.is_administrator() from public, anon;
grant execute on function portfolio_private.is_administrator() to authenticated;

create or replace function portfolio_private.public_evidence(items jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(jsonb_agg(item.value), '[]'::jsonb)
  from jsonb_array_elements(
    case when jsonb_typeof(items) = 'array' then items else '[]'::jsonb end
  ) as item(value)
  where item.value ->> 'visibility' = 'public'
    and nullif(item.value ->> 'storageKey', '') is not null;
$$;

create or replace function portfolio_private.public_records(items jsonb, public_evidence_ids text[])
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(jsonb_agg(
    item.value || jsonb_build_object(
      'evidenceIds', coalesce((
        select jsonb_agg(to_jsonb(reference.id))
        from jsonb_array_elements_text(
          case when jsonb_typeof(item.value -> 'evidenceIds') = 'array'
            then item.value -> 'evidenceIds' else '[]'::jsonb end
        ) as reference(id)
        where reference.id = any(public_evidence_ids)
      ), '[]'::jsonb)
    )
  ), '[]'::jsonb)
  from jsonb_array_elements(
    case when jsonb_typeof(items) = 'array' then items else '[]'::jsonb end
  ) as item(value);
$$;

create or replace function portfolio_private.sanitize_workspace(source_data jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  visible_evidence jsonb;
  visible_ids text[];
begin
  visible_evidence := portfolio_private.public_evidence(source_data -> 'evidence');
  select coalesce(array_agg(item.value ->> 'id'), array[]::text[])
    into visible_ids
    from jsonb_array_elements(visible_evidence) as item(value);

  return source_data || jsonb_build_object(
    'evidence', visible_evidence,
    'tasks', portfolio_private.public_records(source_data -> 'tasks', visible_ids),
    'projects', portfolio_private.public_records(source_data -> 'projects', visible_ids),
    'skills', portfolio_private.public_records(source_data -> 'skills', visible_ids),
    'learning', portfolio_private.public_records(source_data -> 'learning', visible_ids),
    'leadership', portfolio_private.public_records(source_data -> 'leadership', visible_ids),
    'reports', portfolio_private.public_records(source_data -> 'reports', visible_ids)
  );
end;
$$;

create table if not exists public.portfolio_public (
  id boolean primary key default true check (id),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_public enable row level security;
revoke all on table public.portfolio_public from public, anon, authenticated;
grant select on table public.portfolio_public to anon, authenticated;
drop policy if exists "Anyone can read the public portfolio" on public.portfolio_public;
create policy "Anyone can read the public portfolio"
  on public.portfolio_public for select to anon, authenticated
  using (id = true);

-- Remove prior per-user policies and any broad policy that may have been added
-- to this dedicated table. Only the allowlisted Auth account can use it.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'workspaces'
  loop
    execute format('drop policy if exists %I on public.workspaces', existing_policy.policyname);
  end loop;
end;
$$;

alter table public.workspaces enable row level security;
revoke all on table public.workspaces from public, anon, authenticated;
grant select, insert, update, delete on table public.workspaces to authenticated;

create policy "Administrator can read workspace"
  on public.workspaces for select to authenticated
  using (
    user_id = (select auth.uid())
    and portfolio_private.is_administrator()
  );
create policy "Administrator can create workspace"
  on public.workspaces for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and portfolio_private.is_administrator()
  );
create policy "Administrator can update workspace"
  on public.workspaces for update to authenticated
  using (
    user_id = (select auth.uid())
    and portfolio_private.is_administrator()
  )
  with check (
    user_id = (select auth.uid())
    and portfolio_private.is_administrator()
  );
create policy "Administrator can delete workspace"
  on public.workspaces for delete to authenticated
  using (
    user_id = (select auth.uid())
    and portfolio_private.is_administrator()
  );

create or replace function portfolio_private.sync_public_portfolio()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_user_id uuid;
  source_data jsonb;
  source_email text;
begin
  if tg_op = 'DELETE' then
    source_user_id := old.user_id;
    source_data := old.data;
  else
    source_user_id := new.user_id;
    source_data := new.data;
  end if;

  select lower(email) into source_email
  from auth.users
  where id = source_user_id;

  if source_email is distinct from 'mashoaiallen@gmail.com' then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  if tg_op = 'DELETE' then
    delete from public.portfolio_public where id = true;
    return old;
  end if;

  insert into public.portfolio_public (id, data, updated_at)
  values (true, portfolio_private.sanitize_workspace(source_data), now())
  on conflict (id) do update
    set data = excluded.data, updated_at = excluded.updated_at;

  return new;
end;
$$;

revoke all on function portfolio_private.public_evidence(jsonb) from public, anon, authenticated;
revoke all on function portfolio_private.public_records(jsonb, text[]) from public, anon, authenticated;
revoke all on function portfolio_private.sanitize_workspace(jsonb) from public, anon, authenticated;
revoke all on function portfolio_private.sync_public_portfolio() from public, anon, authenticated;

drop trigger if exists sync_public_portfolio_after_workspace_change on public.workspaces;
create trigger sync_public_portfolio_after_workspace_change
  after insert or update or delete on public.workspaces
  for each row execute function portfolio_private.sync_public_portfolio();

-- Populate the public view for an existing administrator workspace.
insert into public.portfolio_public (id, data, updated_at)
select true, portfolio_private.sanitize_workspace(workspaces.data), now()
from public.workspaces as workspaces
join auth.users on auth.users.id = workspaces.user_id
where lower(auth.users.email) = 'mashoaiallen@gmail.com'
on conflict (id) do update
  set data = excluded.data, updated_at = excluded.updated_at;

-- The current evidence bucket is always private and administrator-only.
insert into storage.buckets (id, name, public, file_size_limit)
values ('portfolio-evidence', 'portfolio-evidence', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = 20971520;

-- Public downloads are isolated in a separate public bucket. Public bucket URLs
-- are readable without a session, while object writes still require admin RLS.
insert into storage.buckets (id, name, public, file_size_limit)
values ('portfolio-public-evidence', 'portfolio-public-evidence', true, 20971520)
on conflict (id) do update set public = true, file_size_limit = 20971520;

grant select, insert, update, delete on table storage.objects to authenticated;

-- Replace any existing policy explicitly scoped to either portfolio bucket.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (coalesce(qual, '') || coalesce(with_check, '')) like '%portfolio-evidence%'
  loop
    execute format('drop policy if exists %I on storage.objects', existing_policy.policyname);
  end loop;
end;
$$;

drop policy if exists "Users can read their evidence files" on storage.objects;
drop policy if exists "Users can upload their evidence files" on storage.objects;
drop policy if exists "Users can update their evidence files" on storage.objects;
drop policy if exists "Users can delete their evidence files" on storage.objects;
drop policy if exists "Administrator can read private evidence" on storage.objects;
drop policy if exists "Administrator can upload private evidence" on storage.objects;
drop policy if exists "Administrator can update private evidence" on storage.objects;
drop policy if exists "Administrator can delete private evidence" on storage.objects;
drop policy if exists "Administrator can read public evidence" on storage.objects;
drop policy if exists "Administrator can upload public evidence" on storage.objects;
drop policy if exists "Administrator can update public evidence" on storage.objects;
drop policy if exists "Administrator can delete public evidence" on storage.objects;

create policy "Administrator can read private evidence"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  );
create policy "Administrator can upload private evidence"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  );
create policy "Administrator can update private evidence"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  )
  with check (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  );
create policy "Administrator can delete private evidence"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'portfolio-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  );

create policy "Administrator can read public evidence"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'portfolio-public-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  );
create policy "Administrator can upload public evidence"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio-public-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  );
create policy "Administrator can update public evidence"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'portfolio-public-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  )
  with check (
    bucket_id = 'portfolio-public-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  );
create policy "Administrator can delete public evidence"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'portfolio-public-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and portfolio_private.is_administrator()
  );
