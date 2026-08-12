-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Superadmin platform — church profiles, billing, feature flags,
-- audit log, support tickets, platform activity, notification prefs.
-- Sprint Days 40–45
-- ─────────────────────────────────────────────────────────────────────────────

-- ── church_profiles: superadmin-facing extension of churches ────────────────
-- One row per church. Holds geo coordinates for the distribution map, the
-- suspended/read-only flag, and the setup-completion checkpoints shown on the
-- superadmin health-score widget.

create table if not exists public.church_profiles (
  church_id               uuid primary key references public.churches(id) on delete cascade,
  latitude                numeric(8,5),
  longitude               numeric(8,5),
  logo_url                text,
  is_suspended            boolean not null default false,
  suspended_at            timestamptz,
  suspended_reason        text,
  first_member_added_at   timestamptz,
  first_event_created_at  timestamptz,
  setup_completed_at      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create trigger church_profiles_updated_at
  before update on public.church_profiles
  for each row execute function set_updated_at();

-- ── platform_admins: superadmin allowlist (separate from tenant-scoped roles) ──

create table if not exists public.platform_admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  label       text not null default 'Platform Owner',
  created_at  timestamptz not null default now()
);

create or replace function public.is_platform_admin()
returns boolean language sql stable as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid());
$$;

-- ── subscriptions ─────────────────────────────────────────────────────────────

create type subscription_plan as enum ('community', 'growth', 'enterprise');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');

create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  church_id             uuid not null references public.churches(id) on delete cascade,
  plan                  subscription_plan not null default 'community',
  status                subscription_status not null default 'trialing',
  mrr                   numeric(10,2) not null default 0,
  currency              text not null default 'USD',
  current_period_start  timestamptz not null default now(),
  current_period_end    timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end  boolean not null default false,
  canceled_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create unique index if not exists subscriptions_church_idx on public.subscriptions (church_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function set_updated_at();

-- ── invoices ──────────────────────────────────────────────────────────────────

create type invoice_status as enum ('paid', 'failed', 'refunded', 'pending');

create table if not exists public.invoices (
  id                uuid primary key default gen_random_uuid(),
  church_id         uuid not null references public.churches(id) on delete cascade,
  subscription_id   uuid references public.subscriptions(id) on delete set null,
  invoice_number    text not null,
  amount            numeric(10,2) not null,
  currency          text not null default 'USD',
  status            invoice_status not null default 'pending',
  issued_at         timestamptz not null default now(),
  paid_at           timestamptz
);

create index if not exists invoices_church_idx on public.invoices (church_id, issued_at desc);

-- ── feature flags: global catalog + per-church state ─────────────────────────

create table if not exists public.feature_flags (
  key           text primary key,
  label         text not null,
  description   text,
  category      text not null default 'general'
);

create table if not exists public.church_feature_flags (
  church_id     uuid not null references public.churches(id) on delete cascade,
  flag_key      text not null references public.feature_flags(key) on delete cascade,
  enabled       boolean not null default true,
  changed_at    timestamptz not null default now(),
  changed_by    text,
  primary key (church_id, flag_key)
);

insert into public.feature_flags (key, label, description, category) values
  ('communication_channels', 'Communication Channels', 'SMS, email, WhatsApp, and push messaging.',  'Communication'),
  ('attendance_kiosk',       'Attendance Kiosk Mode',  'Self check-in kiosk and QR scanner.',         'Attendance'),
  ('household_management',   'Household Management',  'Family/household linking and views.',         'Members'),
  ('bulk_member_import',     'Bulk Member Import',     'CSV import wizard for members.',              'Members'),
  ('advanced_reporting',     'Advanced Reporting',     'Analytics dashboards and trend charts.',      'Analytics'),
  ('meilisearch_search',     'Instant Search',         'Meilisearch-powered member search.',          'Members'),
  ('custom_domains',         'Custom Domains',         'Bring your own domain for the member portal.','Platform'),
  ('api_access',             'API Access',             'Programmatic access via the ChMS API.',       'Platform')
on conflict (key) do nothing;

-- ── audit log ─────────────────────────────────────────────────────────────────

create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  actor_label   text not null,
  action        text not null,
  target_type   text not null,
  target_id     text,
  church_id     uuid references public.churches(id) on delete set null,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

-- ── support tickets (support volume trend) ───────────────────────────────────

create type support_ticket_status as enum ('open', 'pending', 'resolved', 'closed');

create table if not exists public.support_tickets (
  id            uuid primary key default gen_random_uuid(),
  church_id     uuid references public.churches(id) on delete set null,
  subject       text not null,
  status        support_ticket_status not null default 'open',
  priority      text not null default 'normal',
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz
);

create index if not exists support_tickets_created_idx on public.support_tickets (created_at desc);

-- ── platform activity feed ───────────────────────────────────────────────────

create table if not exists public.platform_activity (
  id            uuid primary key default gen_random_uuid(),
  type          text not null, -- 'signup' | 'plan_change' | 'suspend' | 'restore' | 'churn'
  church_id     uuid references public.churches(id) on delete set null,
  church_name   text not null,
  description   text not null,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists platform_activity_created_idx on public.platform_activity (created_at desc);

-- ── member notification preferences (Day 40 unsubscribe page) ───────────────
-- Read via a capability token (unsub_token), not a login session — see RLS
-- note below: no anon policy is granted here, the /api/unsubscribe route uses
-- the service-role key server-side when configured, and a mock fallback
-- otherwise, so the anon key never gets blanket read access to this table.

create table if not exists public.member_notification_prefs (
  member_id         uuid primary key references public.members(id) on delete cascade,
  unsub_token       uuid not null default gen_random_uuid(),
  sms_enabled       boolean not null default true,
  email_enabled     boolean not null default true,
  whatsapp_enabled  boolean not null default true,
  push_enabled      boolean not null default true,
  categories        jsonb not null default '{"announcements": true, "events": true, "newsletter": true, "giving": true}'::jsonb,
  updated_at        timestamptz not null default now()
);

create unique index if not exists member_notification_prefs_token_idx
  on public.member_notification_prefs (unsub_token);

create trigger member_notification_prefs_updated_at
  before update on public.member_notification_prefs
  for each row execute function set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.church_profiles           enable row level security;
alter table public.platform_admins           enable row level security;
alter table public.subscriptions             enable row level security;
alter table public.invoices                  enable row level security;
alter table public.feature_flags             enable row level security;
alter table public.church_feature_flags      enable row level security;
alter table public.audit_log                 enable row level security;
alter table public.support_tickets           enable row level security;
alter table public.platform_activity         enable row level security;
alter table public.member_notification_prefs enable row level security;

create policy "Users can check own admin status" on public.platform_admins
  for select to authenticated using (user_id = auth.uid());

create policy "Platform admins manage church_profiles" on public.church_profiles
  for all to authenticated using (is_platform_admin()) with check (is_platform_admin());

create policy "Church members can view their own profile" on public.church_profiles
  for select to authenticated using (
    church_id in (select church_id from public.user_church_roles where user_id = auth.uid())
  );

create policy "Platform admins manage subscriptions" on public.subscriptions
  for all to authenticated using (is_platform_admin()) with check (is_platform_admin());

create policy "Church admins view own subscription" on public.subscriptions
  for select to authenticated using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid() and role in ('admin', 'finance')
    )
  );

create policy "Platform admins manage invoices" on public.invoices
  for all to authenticated using (is_platform_admin()) with check (is_platform_admin());

create policy "Church admins view own invoices" on public.invoices
  for select to authenticated using (
    church_id in (
      select church_id from public.user_church_roles
      where user_id = auth.uid() and role in ('admin', 'finance')
    )
  );

create policy "Authenticated users can view the flag catalog" on public.feature_flags
  for select to authenticated using (true);

create policy "Platform admins manage the flag catalog" on public.feature_flags
  for all to authenticated using (is_platform_admin()) with check (is_platform_admin());

create policy "Platform admins manage church feature flags" on public.church_feature_flags
  for all to authenticated using (is_platform_admin()) with check (is_platform_admin());

create policy "Church members view own feature flags" on public.church_feature_flags
  for select to authenticated using (
    church_id in (select church_id from public.user_church_roles where user_id = auth.uid())
  );

create policy "Platform admins manage the audit log" on public.audit_log
  for all to authenticated using (is_platform_admin()) with check (is_platform_admin());

create policy "Platform admins manage support tickets" on public.support_tickets
  for all to authenticated using (is_platform_admin()) with check (is_platform_admin());

create policy "Platform admins manage platform activity" on public.platform_activity
  for all to authenticated using (is_platform_admin()) with check (is_platform_admin());

create policy "Members manage own notification prefs" on public.member_notification_prefs
  for all to authenticated using (
    member_id in (
      select id from public.members where church_id in (
        select church_id from public.user_church_roles where user_id = auth.uid()
      )
    )
  );

-- ── Seed: sample platform admin + church profile geo data ───────────────────
-- Uncomment and replace <user_id> / <church_id> with real UUIDs once you have
-- at least one signed-up user and church to promote to Platform Owner.
--
-- insert into public.platform_admins (user_id) values ('<user_id>');
-- insert into public.church_profiles (church_id, latitude, longitude)
--   values ('<church_id>', 5.6037, -0.1870); -- Accra, Ghana
