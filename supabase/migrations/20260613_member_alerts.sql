-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: member status history, member alerts, and aging-alert job
-- Sprint Day 18 — Edit Member form + Status change modal + Aging alerts
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Run in the Supabase SQL editor or via `supabase db push`.

-- ── 0. Extended member columns ────────────────────────────────────────────────
-- The Add/Edit Member form (Day 17/18) writes these fields; add them here so
-- inserts and updates persist against a real database (they were previously
-- only exercised through the mock fallback).

alter table public.members
  add column if not exists date_of_birth     date,
  add column if not exists gender            text,
  add column if not exists address           text,
  add column if not exists city              text,
  add column if not exists country           text,
  add column if not exists denomination      text,
  add column if not exists baptised          boolean default false,
  add column if not exists household_head_id uuid references public.members(id) on delete set null,
  add column if not exists household_role    text
    check (household_role in ('head','spouse','child','other'));

-- ── 1. Status history ─────────────────────────────────────────────────────────
-- One row per status transition, with the reason captured in the status modal.

create table if not exists public.member_status_history (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members(id) on delete cascade,
  church_id   uuid not null references public.churches(id) on delete cascade,
  from_status member_status,
  to_status   member_status not null,
  reason      text,
  changed_by  uuid references auth.users(id) on delete set null,
  changed_at  timestamptz not null default now()
);

create index if not exists member_status_history_member_idx
  on public.member_status_history (member_id, changed_at desc);

alter table public.member_status_history enable row level security;

create policy "Church members can view status history"
  on public.member_status_history for select
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles where user_id = auth.uid()
    )
  );

create policy "Staff can insert status history"
  on public.member_status_history for insert
  to authenticated
  with check (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid() and role in ('admin','pastor','staff')
    )
  );

-- ── 2. Member alerts ──────────────────────────────────────────────────────────
-- Populated by the aging-alert job. `status` lets staff resolve/dismiss alerts.

create table if not exists public.member_alerts (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references public.churches(id) on delete cascade,
  member_id   uuid not null references public.members(id) on delete cascade,
  type        text not null check (type in ('aging_visitor','dormant_member')),
  severity    text not null default 'warning' check (severity in ('info','warning','critical')),
  message     text not null,
  status      text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists member_alerts_church_status_idx
  on public.member_alerts (church_id, status);

-- At most one OPEN alert of a given type per member (re-running the job is idempotent).
create unique index if not exists member_alerts_open_unique
  on public.member_alerts (member_id, type)
  where status = 'open';

alter table public.member_alerts enable row level security;

create policy "Church members can view alerts"
  on public.member_alerts for select
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles where user_id = auth.uid()
    )
  );

create policy "Staff can manage alerts"
  on public.member_alerts for all
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid() and role in ('admin','pastor','staff')
    )
  )
  with check (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid() and role in ('admin','pastor','staff')
    )
  );

-- ── 3. Aging-alert job ────────────────────────────────────────────────────────
-- Inserts alerts for members whose status has gone "stale":
--   • aging_visitor  — still a visitor more than `p_visitor_days` after joining
--   • dormant_member — marked inactive more than `p_inactive_days` after joining
-- The partial unique index above makes re-runs idempotent (ON CONFLICT DO NOTHING).
-- Returns the number of new alerts created.

create or replace function public.run_aging_alerts(
  p_church_id    uuid default null,
  p_visitor_days int  default 30,
  p_inactive_days int default 90
)
returns integer
language plpgsql
security definer
as $$
declare
  v_count integer := 0;
  v_inserted integer;
begin
  -- Aging visitors
  insert into public.member_alerts (church_id, member_id, type, severity, message)
  select m.church_id, m.id, 'aging_visitor', 'warning',
         'Visitor for over ' || p_visitor_days || ' days — consider follow-up or membership.'
  from public.members m
  where m.deleted_at is null
    and m.status = 'visitor'
    and m.joined_date <= current_date - p_visitor_days
    and (p_church_id is null or m.church_id = p_church_id)
  on conflict (member_id, type) where (status = 'open') do nothing;
  get diagnostics v_inserted = row_count;
  v_count := v_count + v_inserted;

  -- Dormant (inactive) members
  insert into public.member_alerts (church_id, member_id, type, severity, message)
  select m.church_id, m.id, 'dormant_member', 'warning',
         'Member inactive for some time — schedule a re-engagement visit.'
  from public.members m
  where m.deleted_at is null
    and m.status = 'inactive'
    and m.joined_date <= current_date - p_inactive_days
    and (p_church_id is null or m.church_id = p_church_id)
  on conflict (member_id, type) where (status = 'open') do nothing;
  get diagnostics v_inserted = row_count;
  v_count := v_count + v_inserted;

  return v_count;
end;
$$;

-- ── 4. Scheduling (pg_cron) ───────────────────────────────────────────────────
-- If pg_cron is enabled in your Supabase project, schedule a daily 02:00 run:
--
--   select cron.schedule(
--     'aging-alerts-daily',
--     '0 2 * * *',
--     $$ select public.run_aging_alerts(); $$
--   );
--
-- Alternatively, trigger POST /api/jobs/aging-alerts from a Vercel Cron / GitHub
-- Action on a schedule (the route calls run_aging_alerts under the hood).
