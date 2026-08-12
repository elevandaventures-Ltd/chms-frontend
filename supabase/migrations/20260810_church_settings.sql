-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: church branding/general settings, custom fields, staff
-- invitations, and church-scoped audit log access.
-- Sprint Days 46–50
-- ─────────────────────────────────────────────────────────────────────────────

-- ── church_profiles additions (Day 47) ───────────────────────────────────────
-- logo_url already exists (20260716_superadmin_platform.sql). Add the rest of
-- the branding + general settings fields the church-admin Settings pages edit.

alter table public.church_profiles
  add column if not exists accent_color     text not null default '#b25131',
  add column if not exists welcome_message  text,
  add column if not exists timezone         text not null default 'Africa/Accra',
  add column if not exists currency         text not null default 'GHS',
  add column if not exists language         text not null default 'en',
  add column if not exists ministries       text[] not null default '{}';

create policy "Church admins can update own branding" on public.church_profiles
  for update to authenticated using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid() and role in ('admin', 'pastor')
    )
  );

-- ── Custom member-profile fields (Day 49) ────────────────────────────────────

create type custom_field_type as enum ('text', 'number', 'date', 'dropdown', 'boolean');

create table if not exists public.church_custom_fields (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references public.churches(id) on delete cascade,
  label       text not null,
  type        custom_field_type not null,
  options     text[],
  required    boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists church_custom_fields_church_idx on public.church_custom_fields (church_id, sort_order);

alter table public.church_custom_fields enable row level security;

create policy "Church members can view custom fields" on public.church_custom_fields
  for select to authenticated using (
    church_id in (select church_id from public.user_church_roles where user_id = auth.uid())
  );

create policy "Church admins manage custom fields" on public.church_custom_fields
  for all to authenticated using (
    church_id in (select church_id from public.user_church_roles where user_id = auth.uid() and role in ('admin', 'pastor'))
  ) with check (
    church_id in (select church_id from public.user_church_roles where user_id = auth.uid() and role in ('admin', 'pastor'))
  );

-- Custom field values live alongside each member as a flexible jsonb bag
-- rather than one column per church-defined field.
alter table public.members add column if not exists custom_field_values jsonb not null default '{}'::jsonb;

-- ── Staff invitations (Day 46) ───────────────────────────────────────────────

create type invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');

create table if not exists public.staff_invitations (
  id            uuid primary key default gen_random_uuid(),
  church_id     uuid not null references public.churches(id) on delete cascade,
  token         uuid not null default gen_random_uuid(),
  email         text not null,
  role          church_role not null default 'staff',
  status        invitation_status not null default 'pending',
  invited_by    uuid references auth.users(id) on delete set null,
  invited_at    timestamptz not null default now(),
  accepted_at   timestamptz
);

create unique index if not exists staff_invitations_token_idx on public.staff_invitations (token);
create index if not exists staff_invitations_church_idx on public.staff_invitations (church_id, status);

alter table public.staff_invitations enable row level security;

create policy "Church admins manage invitations" on public.staff_invitations
  for all to authenticated using (
    church_id in (select church_id from public.user_church_roles where user_id = auth.uid() and role in ('admin', 'pastor'))
  ) with check (
    church_id in (select church_id from public.user_church_roles where user_id = auth.uid() and role in ('admin', 'pastor'))
  );

-- No anon/public SELECT policy is granted here on purpose — same reasoning
-- as member_notification_prefs (20260716 migration): a public invitation
-- token must not be checkable via the anon key with a blanket RLS policy,
-- since that key is embedded in the browser bundle and "using (true)" would
-- let anyone enumerate every pending invite. /api/team/invitations/:token
-- uses the service-role key server-side when configured, and the in-memory
-- church-store otherwise.

-- ── Church-scoped audit log access (Day 48) ──────────────────────────────────
-- audit_log already exists (20260716_superadmin_platform.sql), scoped to
-- platform admins only. Add a second SELECT policy so a church's own admins
-- can see their own church_id's rows, and an INSERT policy so church-level
-- actions (member edits, role changes) can be recorded at all.

create policy "Church admins can view their own audit log" on public.audit_log
  for select to authenticated using (
    church_id in (select church_id from public.user_church_roles where user_id = auth.uid() and role in ('admin', 'pastor'))
  );

create policy "Church admins can record their own audit log entries" on public.audit_log
  for insert to authenticated with check (
    church_id in (select church_id from public.user_church_roles where user_id = auth.uid() and role in ('admin', 'pastor'))
  );
