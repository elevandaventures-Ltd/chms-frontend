-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: soft-delete for members table
-- Sprint Day 13 — Meilisearch search + soft-delete
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Adds a deleted_at column so members are never hard-deleted.
-- All queries should filter WHERE deleted_at IS NULL.
-- Meilisearch should be notified via a trigger or webhook to remove the
-- document from the index when deleted_at is set.

-- 1. Add soft-delete column
alter table public.members
  add column if not exists deleted_at timestamptz;

-- 2. Index for fast "not deleted" queries
create index if not exists members_not_deleted_idx
  on public.members (church_id)
  where deleted_at is null;

-- 3. Update RLS policies to exclude soft-deleted rows
-- Drop and recreate the select policy
drop policy if exists "Church members can view members" on public.members;

create policy "Church members can view members"
  on public.members for select
  to authenticated
  using (
    deleted_at is null
    and church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
    )
  );

-- 4. Soft-delete function (call instead of DELETE)
create or replace function soft_delete_member(member_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.members
  set deleted_at = now()
  where id = member_id;
end;
$$;

-- ── Meilisearch sync (webhook approach) ──────────────────────────────────────
--
-- Option A — Supabase Database Webhooks (recommended):
--   Create a webhook in Supabase dashboard → Database → Webhooks
--   Event: UPDATE on public.members
--   HTTP endpoint: https://your-app.com/api/webhooks/meilisearch-sync
--   This endpoint should re-index updated members or delete from index
--   when deleted_at IS NOT NULL.
--
-- Option B — pg_net extension (Supabase built-in):
--   The trigger below calls a Next.js webhook via HTTP directly from Postgres.
--   Uncomment if pg_net is available in your Supabase project.
--
-- create or replace function notify_meilisearch()
-- returns trigger language plpgsql as $$
-- begin
--   if new.deleted_at is not null then
--     -- Member soft-deleted — remove from index
--     perform net.http_delete(
--       url := current_setting('app.meilisearch_host') || '/indexes/members/documents/' || new.id,
--       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.meilisearch_key'))
--     );
--   else
--     -- Member created or updated — upsert into index
--     perform net.http_post(
--       url := current_setting('app.meilisearch_host') || '/indexes/members/documents',
--       body := row_to_json(new)::text,
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || current_setting('app.meilisearch_key')
--       )
--     );
--   end if;
--   return new;
-- end;
-- $$;
--
-- create trigger members_meilisearch_sync
--   after insert or update on public.members
--   for each row execute function notify_meilisearch();
