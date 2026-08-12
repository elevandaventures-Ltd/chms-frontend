-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: attendance sessions + check-in records
-- Sprint Day 21 — Attendance page + session cards
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Run in the Supabase SQL editor or via `supabase db push`.

create type session_type as enum (
  'sunday_service', 'midweek', 'sunday_school', 'special_event'
);

create type session_status as enum ('active', 'ended');

-- ── Sessions ──────────────────────────────────────────────────────────────────

create table if not exists public.attendance_sessions (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references public.churches(id) on delete cascade,
  type        session_type   not null,
  title       text,
  status      session_status not null default 'active',
  date        date           not null default current_date,
  started_at  timestamptz    not null default now(),
  ended_at    timestamptz,
  count       integer        not null default 0,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz    not null default now(),
  updated_at  timestamptz    not null default now()
);

create index if not exists attendance_sessions_church_status_idx
  on public.attendance_sessions (church_id, status, date desc);

create trigger attendance_sessions_updated_at
  before update on public.attendance_sessions
  for each row execute function set_updated_at();

-- ── Check-in records ────────────────────────────────────────────────────────
-- One row per member per session. `count` on the session is the denormalised
-- head count kept in sync by the trigger below.

create table if not exists public.attendance_records (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.attendance_sessions(id) on delete cascade,
  member_id   uuid references public.members(id) on delete set null,
  checked_in_at timestamptz not null default now(),
  unique (session_id, member_id)
);

create index if not exists attendance_records_session_idx
  on public.attendance_records (session_id);

-- Keep attendance_sessions.count in sync with the records table.
create or replace function sync_session_count()
returns trigger language plpgsql as $$
declare
  v_session uuid := coalesce(new.session_id, old.session_id);
begin
  update public.attendance_sessions
  set count = (select count(*) from public.attendance_records where session_id = v_session)
  where id = v_session;
  return null;
end;
$$;

create trigger attendance_records_count
  after insert or delete on public.attendance_records
  for each row execute function sync_session_count();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.attendance_sessions enable row level security;
alter table public.attendance_records  enable row level security;

create policy "Church members can view sessions"
  on public.attendance_sessions for select
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles where user_id = auth.uid()
    )
  );

create policy "Staff can manage sessions"
  on public.attendance_sessions for all
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid() and role in ('admin', 'pastor', 'ministry_leader', 'staff')
    )
  )
  with check (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid() and role in ('admin', 'pastor', 'ministry_leader', 'staff')
    )
  );

create policy "Church members can view records"
  on public.attendance_records for select
  to authenticated
  using (
    session_id in (
      select id from public.attendance_sessions
      where church_id in (
        select church_id from public.user_church_roles where user_id = auth.uid()
      )
    )
  );

create policy "Staff can manage records"
  on public.attendance_records for all
  to authenticated
  using (
    session_id in (
      select id from public.attendance_sessions
      where church_id in (
        select church_id from public.user_church_roles
        where user_id = auth.uid() and role in ('admin', 'pastor', 'ministry_leader', 'staff')
      )
    )
  )
  with check (
    session_id in (
      select id from public.attendance_sessions
      where church_id in (
        select church_id from public.user_church_roles
        where user_id = auth.uid() and role in ('admin', 'pastor', 'ministry_leader', 'staff')
      )
    )
  );

-- ── Seed: sample sessions for testing ────────────────────────────────────────
-- Uncomment and replace <church_id> with a real UUID after onboarding.
--
-- insert into public.attendance_sessions (church_id, type, title, status, date, count)
-- values
--   ('<church_id>', 'sunday_service', 'Sunday First Service', 'active', current_date, 142),
--   ('<church_id>', 'midweek', 'Wednesday Bible Study', 'ended', current_date - 4, 76);
