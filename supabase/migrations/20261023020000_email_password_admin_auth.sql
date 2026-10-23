-- Email/password Auth is the administrator sign-in method. Keep the same
-- explicit email allowlist for workspace and evidence access.
create or replace function portfolio_private.is_administrator()
returns boolean
language sql
stable
set search_path = ''
as $$
  select lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'mashoaiallen@gmail.com';
$$;

revoke all on function portfolio_private.is_administrator() from public, anon;
grant execute on function portfolio_private.is_administrator() to authenticated;
