-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: households table + family linking API support
-- Sprint Day 14 — Member filter bar
-- ─────────────────────────────────────────────────────────────────────────────

-- Add age_group and zone columns to members (needed for Day 14 filters)
alter table public.members
  add column if not exists age_group text
    check (age_group in ('child','youth','young_adult','adult','senior')),
  add column if not exists zone text;

create index if not exists members_age_group_idx on public.members (age_group);
create index if not exists members_zone_idx       on public.members (zone);

-- ── Households ────────────────────────────────────────────────────────────────

create table if not exists public.households (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references public.churches(id) on delete cascade,
  name        text not null,           -- e.g. "The Mensah Family"
  address     text,
  zone        text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists households_church_idx on public.households (church_id);

-- Trigger to keep updated_at current
create trigger households_updated_at
  before update on public.households
  for each row execute function set_updated_at();

-- ── Member ↔ Household link ───────────────────────────────────────────────────

alter table public.members
  add column if not exists household_id uuid references public.households(id) on delete set null,
  add column if not exists is_head_of_household boolean not null default false;

create index if not exists members_household_idx on public.members (household_id);

-- ── RLS for households ────────────────────────────────────────────────────────

alter table public.households enable row level security;

create policy "Church members can view households"
  on public.households for select
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
    )
  );

create policy "Staff can manage households"
  on public.households for all
  to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
        and role in ('admin', 'pastor', 'staff')
    )
  )
  with check (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
        and role in ('admin', 'pastor', 'staff')
    )
  );

-- ── Family linking helpers ────────────────────────────────────────────────────

-- Assign a member to a household
create or replace function assign_member_to_household(
  p_member_id    uuid,
  p_household_id uuid,
  p_is_head      boolean default false
)
returns void language plpgsql security definer as $$
begin
  update public.members
  set household_id          = p_household_id,
      is_head_of_household  = p_is_head,
      updated_at            = now()
  where id = p_member_id;
end;
$$;

-- Remove a member from their household
create or replace function remove_member_from_household(p_member_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.members
  set household_id          = null,
      is_head_of_household  = false,
      updated_at            = now()
  where id = p_member_id;
end;
$$;
