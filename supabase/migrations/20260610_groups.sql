-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: groups hierarchy + member assignment
-- Sprint Day 15 — Member profile drawer
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Groups ────────────────────────────────────────────────────────────────────
-- A group is any organisational unit in the church: a ministry team, cell group,
-- service team, choir section, etc. Groups can be nested via parent_id.

create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references public.churches(id) on delete cascade,
  parent_id   uuid references public.groups(id) on delete set null, -- for hierarchy
  name        text not null,
  description text,
  type        text not null default 'ministry'
    check (type in ('ministry','cell','service','choir','other')),
  leader_id   uuid references public.members(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists groups_church_idx on public.groups (church_id);
create index if not exists groups_parent_idx on public.groups (parent_id);

create trigger groups_updated_at
  before update on public.groups
  for each row execute function set_updated_at();

-- ── Member ↔ Group assignments ────────────────────────────────────────────────

create table if not exists public.member_groups (
  member_id  uuid not null references public.members(id) on delete cascade,
  group_id   uuid not null references public.groups(id)  on delete cascade,
  role       text not null default 'member'
    check (role in ('leader','co_leader','member')),
  joined_at  timestamptz not null default now(),
  primary key (member_id, group_id)
);

create index if not exists member_groups_group_idx  on public.member_groups (group_id);
create index if not exists member_groups_member_idx on public.member_groups (member_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.groups       enable row level security;
alter table public.member_groups enable row level security;

-- Church members can view all groups in their church
create policy "Church members can view groups"
  on public.groups for select to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
    )
  );

-- Staff/admin can manage groups
create policy "Staff can manage groups"
  on public.groups for all to authenticated
  using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
        and role in ('admin','pastor','staff','ministry_leader')
    )
  )
  with check (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid()
        and role in ('admin','pastor','staff','ministry_leader')
    )
  );

create policy "Church members can view member_groups"
  on public.member_groups for select to authenticated
  using (
    group_id in (
      select id from public.groups
      where church_id in (
        select church_id from public.user_church_roles
        where user_id = auth.uid()
      )
    )
  );

create policy "Staff can manage member_groups"
  on public.member_groups for all to authenticated
  using (
    group_id in (
      select id from public.groups g
      join public.user_church_roles ucr on ucr.church_id = g.church_id
      where ucr.user_id = auth.uid()
        and ucr.role in ('admin','pastor','staff','ministry_leader')
    )
  )
  with check (
    group_id in (
      select id from public.groups g
      join public.user_church_roles ucr on ucr.church_id = g.church_id
      where ucr.user_id = auth.uid()
        and ucr.role in ('admin','pastor','staff','ministry_leader')
    )
  );
