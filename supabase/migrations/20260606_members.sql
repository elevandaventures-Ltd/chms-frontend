-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: members table
-- Sprint Day 11 — Member Directory
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Run this in your Supabase SQL editor or via the Supabase CLI:
--   supabase db push
--
-- Table structure mirrors the Member type in src/lib/site.ts.

create type member_status as enum ('active', 'inactive', 'visitor');

create type church_role as enum (
  'admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member'
);

create table if not exists public.members (
  id           uuid primary key default gen_random_uuid(),
  church_id    uuid not null references public.churches(id) on delete cascade,
  full_name    text not null,
  email        text not null,
  phone        text,
  photo_url    text,
  status       member_status not null default 'active',
  role         church_role   not null default 'member',
  ministries   text[]        not null default '{}',
  joined_date  date          not null default current_date,
  notes        text,
  created_at   timestamptz   not null default now(),
  updated_at   timestamptz   not null default now()
);

-- Unique email per church
create unique index if not exists members_church_email_idx
  on public.members (church_id, lower(email));

-- Fast lookups by church + status
create index if not exists members_church_status_idx
  on public.members (church_id, status);

-- Updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger members_updated_at
  before update on public.members
  for each row execute function set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.members enable row level security;

-- Members of the same church can read all member records
create policy "Church members can view members"
  on public.members for select
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
    )
  );

-- Only admin, pastor, and staff can insert new members
create policy "Staff can insert members"
  on public.members for insert
  to authenticated
  with check (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
        and role in ('admin', 'pastor', 'staff')
    )
  );

-- Only admin, pastor, and staff can update member records
create policy "Staff can update members"
  on public.members for update
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
        and role in ('admin', 'pastor', 'staff')
    )
  );

-- Only admin can delete members
create policy "Admin can delete members"
  on public.members for delete
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
        and role = 'admin'
    )
  );

-- ── Seed: sample member for testing ──────────────────────────────────────────
-- Uncomment and replace <church_id> with a real UUID after running onboarding.
--
-- insert into public.members (church_id, full_name, email, status, role, ministries, joined_date)
-- values ('<church_id>', 'Solomon Leek', 'solomon@elevanda.com', 'active', 'admin', '{"Leadership"}', '2021-01-01');
