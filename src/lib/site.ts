/**
 * site.ts — ChMS application data and type definitions.
 *
 * UserRole matches the 6 roles defined in the Day 9 RBAC spec.
 * The hardcoded currentUser has been removed — use useCurrentUser()
 * from @/hooks/useCurrentUser to get the real signed-in user.
 */

// ── Role types ────────────────────────────────────────────────────────────────

export type UserRole =
  | 'admin'
  | 'pastor'
  | 'finance'
  | 'ministry_leader'
  | 'staff'
  | 'member';

// ── Shared types ──────────────────────────────────────────────────────────────

export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
};

export type NotificationItem = {
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
};

// ── Notifications (static; replace with real-time feed in a later sprint) ────

export const notifications: NotificationItem[] = [
  {
    title: 'Church onboarding wizard live',
    detail: 'Register a new church at /onboarding.',
    time: 'Just now',
    unread: true,
  },
  {
    title: 'Protected routes active',
    detail: 'Unauthenticated users are redirected to /login.',
    time: '1d ago',
    unread: true,
  },
  {
    title: 'Design system updated',
    detail: 'Tailwind CSS, Inter and Playfair Display fonts applied.',
    time: '2d ago',
    unread: false,
  },
];

// ── Sidebar navigation — ChMS routes with RBAC ───────────────────────────────

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    roles: ['admin', 'pastor', 'finance', 'ministry_leader', 'staff', 'member'],
  },
  {
    label: 'Members',
    href: '/members',
    icon: 'members',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff', 'member'],
  },
  {
    label: 'Households',
    href: '/households',
    icon: 'households',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff'],
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: 'attendance',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff'],
  },
  {
    label: 'Events',
    href: '/events',
    icon: 'events',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff', 'member'],
  },
  {
    label: 'Communication',
    href: '/communication',
    icon: 'communication',
    roles: ['admin', 'pastor', 'ministry_leader', 'staff'],
  },
  {
    label: 'Finance',
    href: '/finance',
    icon: 'finance',
    roles: ['admin', 'finance'],
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: 'billing',
    roles: ['admin', 'finance'],
  },
  {
    label: 'Bulletin',
    href: '/bulletin',
    icon: 'bulletin',
    roles: ['admin', 'pastor', 'staff'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'settings',
    roles: ['admin'],
  },
  {
    label: 'Register a Church',
    href: '/onboarding',
    icon: 'onboarding',
    roles: ['admin'],
  },
];

// ── Sprint log ────────────────────────────────────────────────────────────────

export type DayEntry = {
  day: string;
  date: string;
  title: string;
  status: 'complete' | 'in-progress' | 'upcoming';
  detail: string;
  href?: string;
};

export const sprintLog: DayEntry[] = [
  {
    day: 'Day 1',
    date: '2026-05-25',
    title: 'Project baseline',
    status: 'complete',
    detail: 'Next.js 14 App Router with TypeScript strict mode, ESLint, Prettier, path aliases, and environment templates.',
  },
  {
    day: 'Day 2',
    date: '2026-05-26',
    title: 'Design system foundation',
    status: 'complete',
    detail: 'Tailwind CSS v3 + shadcn/ui + Radix UI. Design token system in tailwind.config.ts. Playfair Display (display) + Inter (body). Full typography scale in global CSS.',
  },
  {
    day: 'Day 3',
    date: '2026-05-27',
    title: 'Workspace shell',
    status: 'complete',
    detail: 'Collapsible sidebar with role-aware nav, sticky top navigation, and a responsive max-width page shell across all breakpoints.',
  },
  {
    day: 'Day 4',
    date: '2026-05-28',
    title: 'UI component library + Storybook',
    status: 'complete',
    detail: 'Button, Input, Textarea, Select, Checkbox, and Radio primitives documented with Storybook 8 stories and a11y addon.',
  },
  {
    day: 'Day 5',
    date: '2026-05-31',
    title: 'Extended UI components',
    status: 'complete',
    detail: 'Modal, Drawer, Dropdown, Toast (Sonner), Card, Badge, Avatar, Skeleton — all with Storybook stories.',
  },
  {
    day: 'Day 6',
    date: '2026-06-01',
    title: 'Authentication flows',
    status: 'complete',
    detail: 'Login and signup pages with magic-link and password auth via Supabase. Explicit error states for all failure cases.',
    href: '/login',
  },
  {
    day: 'Day 7',
    date: '2026-06-02',
    title: 'Protected routes + session persistence',
    status: 'complete',
    detail: 'Edge middleware redirects unauthenticated users to /login. Supabase browser client with autoRefreshToken and persistSession.',
  },
  {
    day: 'Day 8',
    date: '2026-06-03',
    title: 'Church onboarding wizard',
    status: 'complete',
    detail: '5-step wizard: church name + logo + denomination (merged step 1), contact, plan selection, review + confirm, done. React context state, progress bar, step-back navigation.',
    href: '/onboarding',
  },
  {
    day: 'Day 9',
    date: '2026-06-04',
    title: 'Plan selection, review step, profile settings',
    status: 'complete',
    detail: 'Plan selection step (Community/Growth/Enterprise), review + confirm step with Supabase insert, profile settings page with avatar upload and password change.',
    href: '/settings/profile',
  },
  {
    day: 'Day 10',
    date: '2026-06-05',
    title: 'Admin layout + role-aware navigation',
    status: 'complete',
    detail: 'AdminShell with dark sidebar, breadcrumbs, and top nav with logout. Role-aware menu — Finance hidden from non-finance roles. Active link highlighting. All ChMS routes scaffolded.',
  },
  {
    day: 'Day 11',
    date: '2026-06-06',
    title: 'Member Directory',
    status: 'complete',
    detail: 'Masonry photo-card grid with 2/3/4 column breakpoints. MemberCard with photo, status badge (Active/Inactive/Visitor), ministry tags, and role label. Live search and status filter. Members table SQL migration with RLS policies.',
    href: '/members',
  },
  {
    day: 'Day 12',
    date: '2026-06-07',
    title: 'Skeleton loading + API connection',
    status: 'complete',
    detail: 'Skeleton shimmer cards during load, GET /api/members with search/filter/pagination, debounced search, error banner with retry, Pagination component wired to directory.',
    href: '/members',
  },
  {
    day: 'Day 13',
    date: '2026-06-08',
    title: 'Meilisearch instant search',
    status: 'complete',
    detail: 'MemberSearchBar with 300ms debounce, fuzzy matching, highlighted matched terms from Meilisearch _formatted fields. /api/search/members endpoint with Meilisearch → Supabase → mock fallback chain. Soft-delete SQL migration.',
    href: '/members',
  },
  {
    day: 'Day 14',
    date: '2026-06-09',
    title: 'Member filter bar',
    status: 'complete',
    detail: 'Filter bar with Ministry dropdown (multi-select), Status pills, Age Group range, Join Date range picker, and Geographic Zone. Active filter count badge, chip summary, clear all. Filters combine with Meilisearch search. Household SQL migration.',
    href: '/members',
  },
  {
    day: 'Day 15',
    date: '2026-06-10',
    title: 'Member profile drawer',
    status: 'complete',
    detail: 'Slide-out profile drawer from member directory cards: header with photo, name, status badge, and quick actions (email, call, message, activate/deactivate); Info tab with contact, church details, ministry teams, and notes; Family & Household tab with one-click member navigation. Groups hierarchy table + member_groups assignment table SQL migration with RLS. POST/DELETE /api/members/groups for group assignment.',
    href: '/members',
  },
  {
    day: 'Day 16',
    date: '2026-06-11',
    title: 'Profile drawer — Timeline, Groups, Notes + enhanced quick actions',
    status: 'complete',
    detail: 'Three new drawer tabs: Timeline (chronological interactions, group joins, milestones), Groups (memberships with join dates, type labels, role badges), Notes (pastoral notes with inline compose form, visibility selector, optimistic add). Quick actions upgraded: WhatsApp (wa.me link), Add Note and Prayer Request (jump to Notes tab), Call (tel: link), Email (mailto:), Message, Activate/Deactivate.',
    href: '/members',
  },
  {
    day: 'Day 17',
    date: '2026-06-12',
    title: 'Add Member form',
    status: 'complete',
    detail: 'Full Add Member form in a slide-out drawer: photo upload (JPEG/PNG/WebP ≤ 2 MB), personal details, contact info + address, family/household linking, denomination custom fields, ministry assignment pill grid, pastoral notes. Zod schema + React Hook Form validation: required fields, email format, phone regex. POST /api/members with Supabase Storage photo upload and mock fallback. Add Member button wired into Member Directory.',
    href: '/members',
  },
  {
    day: 'Day 18',
    date: '2026-06-23',
    title: 'Edit Member form + Status change modal + Aging alerts',
    status: 'complete',
    detail: 'Shared MemberForm powers both Add and Edit (same Zod schema + fields); Edit pre-populates from GET /api/members/:id and saves via PUT (photo replace/remove, mock fallback). Member Status change modal shows current status, lists allowed transitions with a reason field, and requires a confirmation step for destructive (deactivate) changes — PATCH /api/members/:id/status records the transition in member_status_history and auto-resolves open alerts on re-activation. Aging-alert job (POST /api/jobs/aging-alerts → run_aging_alerts) populates member_alerts for stale visitors and dormant members. Edit + Change status wired into the profile drawer.',
    href: '/members',
  },
  {
    day: 'Day 19',
    date: '2026-06-24',
    title: 'Multi-select + bulk actions in member directory',
    status: 'complete',
    detail: 'Hover checkboxes on member cards, "Select all on this page" with indeterminate state, and a sliding bottom bulk-actions bar that appears when members are selected (selection persists across pages via an id→Member map). Bulk menus: Assign to Ministry (pill selector with add/replace modes → POST /api/members/bulk-ministries), Export Selected (dependency-free CSV download + print-to-PDF), and Send Message (composer pre-populated with recipient chips, SMS/Email channel, unreachable-recipient skipping → POST /api/members/messages via Twilio with mock fallback). Shared MINISTRIES list extracted to lib/ministries.ts.',
    href: '/members',
  },
  {
    day: 'Day 20',
    date: '2026-06-25',
    title: 'CSV import flow + standalone household view',
    status: 'complete',
    detail: 'Four-step CSV import wizard: Upload (dependency-free RFC-4180 parser), Map columns (auto-mapped by header name, required Email + name), Preview first 5 normalised rows with per-row validity, and Confirm (dry-run estimate of add/update/skip → commit). POST /api/members/import upserts by email with a dryRun mode and mock fallback. Standalone /households page: household cards listing every member with relationship badges (Head/Spouse/Child) and status dots, fetched from GET /api/households (real households table when populated, otherwise synthesised). Households added to the sidebar.',
    href: '/households',
  },
  {
    day: 'Day 21',
    date: '2026-06-26',
    title: 'Attendance page + session cards',
    status: 'complete',
    detail: 'Attendance page with a "Start New Session" composer (session-type selector — Sunday Service, Midweek, Sunday School, Special Event — optional title + date), an Active Sessions list and a Recent Sessions list. SessionCard shows type, date/time, a live (pulsing) check-in count badge, and contextual Start/End/Reopen buttons. attendance_sessions + attendance_records schema migrated with RLS and a count-sync trigger. GET/POST /api/attendance/sessions and PATCH /api/attendance/sessions/:id, with mock test sessions when Supabase is absent.',
    href: '/attendance',
  },
  {
    day: 'Day 22',
    date: '2026-06-27',
    title: 'QR code check-in scanner',
    status: 'complete',
    detail: 'QR scanner page (/attendance/scan): requests camera permission, renders a live preview, and scans for member QR codes 5×/second (every 200ms) with jsQR. A valid scan posts to POST /api/attendance/sessions/:id/checkin and plays a success animation (green flash + member photo + name + checkmark) for 2 seconds before resetting. Members carry a namespaced QR token (lib/qr); their printable check-in QR is generated with the qrcode library and shown in the profile drawer Info tab. Closes the loop: print QR from profile → scan on camera → attendance recorded.',
    href: '/attendance/scan',
  },
  {
    day: 'Day 34',
    date: '2026-07-09',
    title: 'Message scheduling + scheduled messages list',
    status: 'complete',
    detail: 'Send Now / Schedule toggle in the message composer with a date + time picker and an Africa-focused timezone selector (Nairobi, Lagos, Johannesburg, Accra, Cairo, Kigali, Casablanca). Scheduled tab lists upcoming scheduled messages (send time, channel, recipients) with a Cancel button. No server cron in this project, so the Scheduled tab polls POST /api/communication/schedule/process every 5s to fire due messages while it\'s open — the same "tick" a real queue worker would perform.',
    href: '/communication',
  },
  {
    day: 'Day 35',
    date: '2026-07-10',
    title: 'Send confirmation dialog + sent history',
    status: 'complete',
    detail: 'Send-confirmation dialog before every send/schedule: recipient count, per-status breakdown, and an estimated-delivery time computed from a per-channel gateway rate limit (SMS/WhatsApp/Email/Push each cap requests per minute, mirroring Twilio/WhatsApp Business API tiers). Delivery Reports renamed Sent History with a search box and a Failed count column; /api/communication/send now enforces the same rate limit server-side (429 + Retry-After when exceeded) and writes every send to an in-memory report store so new messages show up immediately.',
    href: '/communication',
  },
  {
    day: 'Day 36',
    date: '2026-07-13',
    title: 'WhatsApp composer + phone preview',
    status: 'complete',
    detail: 'Dedicated WhatsApp composer tab: template selector restricted to WhatsApp-approved templates only (pending/rejected templates are shown but not selectable — matches the WhatsApp Business API bulk-send constraint), per-template variable inputs, and a live recipient list. Phone-mockup preview renders the resolved message in a WhatsApp-style chat bubble with markdown (*bold*/_italic_/~strike~), timestamp, and read ticks.',
    href: '/communication',
  },
  {
    day: 'Day 37',
    date: '2026-07-14',
    title: 'WhatsApp conversation inbox',
    status: 'complete',
    detail: 'Two-panel WhatsApp inbox: conversation list (name, last-message preview, unread badge) and a chat-style message thread. Reply composer with an inline emoji picker and a "You\'re typing…" indicator while composing. No live WhatsApp Business webhook is connected in this project, so a "Simulate reply" button mimics an inbound webhook for testing — the inbox polls every 4s so a simulated reply appears within seconds, same as the review\'s live-reply flow would.',
    href: '/communication',
  },
  {
    day: 'Day 38',
    date: '2026-07-15',
    title: 'Push notification permission + preferences',
    status: 'complete',
    detail: 'Push-permission priming banner ("Allow notifications for event reminders and church announcements") shown before the native browser prompt, with a graceful denied-state message and a persisted "not now" dismissal. Registers a real service worker (public/sw.js) and subscribes via PushManager when a VAPID key is configured; a "Send test notification" button fires a genuine local Notification instantly. New /settings/notifications page: a Event Reminders/New Messages/Prayer Requests/Giving Receipts × SMS/Email/WhatsApp/Push toggle matrix, GET/PATCH /api/notifications/preferences.',
    href: '/settings/notifications',
  },
  {
    day: 'Day 39',
    date: '2026-07-16',
    title: 'Digital bulletin editor + preview',
    status: 'complete',
    detail: '/bulletin editor: church colors + logo branding, welcome message, and sermon series fields, with upcoming events (next 7 days, live from Events) and a giving summary (auto-populated, not editable). /bulletin/preview renders the full bulletin plus a "Send Now" button that generates and sends it to a test email address — mock-delivered and logged server-side when no email provider is configured, real via Resend when RESEND_API_KEY is set.',
    href: '/bulletin',
  },
  {
    day: 'Day 40',
    date: '2026-07-17',
    title: 'Channel performance dashboard + unsubscribe page',
    status: 'complete',
    detail: 'Communication → Analytics tab: channel delivery-rate comparison (SMS/Email/WhatsApp/Push), a best-time-to-send heatmap (day × hour engagement), and a message-category performance breakdown. GET /api/communication/channel-performance. Public /unsubscribe page (no login, reached via a capability token) lets a member see and toggle every channel and category they are subscribed to, or unsubscribe from everything in one click — GET/POST /api/unsubscribe, service-role-gated so the anon key never gets blanket read access to notification prefs.',
    href: '/communication',
  },
  {
    day: 'Day 41',
    date: '2026-07-20',
    title: 'Superadmin layout + church management table',
    status: 'complete',
    detail: 'New /superadmin workspace with its own dark-green SuperadminShell/Sidebar/TopNav and a "Platform Owner" badge — deliberately distinct from the church-admin shell so the two are never confused. Church management table (Church Name, Plan, Members, Status, Country, MRR, Last Active, Actions), sortable, with a row-click detail drawer showing contact info, plan, and a Suspend/Restore action. GET/PATCH /api/superadmin/churches(/:id), an in-memory superadmin store so suspend/restore/plan-change/flag-toggle mutations are visible immediately across the dashboard, and a new church_profiles/platform_admins/subscriptions/invoices/feature_flags/audit_log/support_tickets/platform_activity migration.',
    href: '/superadmin/churches',
  },
  {
    day: 'Day 42',
    date: '2026-07-21',
    title: 'Subscription management + billing history',
    status: 'complete',
    detail: '/billing page for church admins: current plan card, plan comparison table (Community/Growth/Enterprise) with upgrade/downgrade, and a cancel-subscription confirmation flow (schedules cancellation at period end, reversible). Billing history table with a per-invoice "Download Invoice" button (dependency-free print-to-PDF, same window.print() trick as the member CSV/PDF export). Simulated Stripe test-card checkout (4242 4242 4242 4242 succeeds, published decline cards fail) — clearly marked as a training simulation, since real card data must never reach your own server outside Stripe Elements tokenization.',
    href: '/billing',
  },
  {
    day: 'Day 43',
    date: '2026-07-22',
    title: 'Platform health metrics dashboard',
    status: 'complete',
    detail: 'Superadmin dashboard KPI row: MRR, ARR, Active Churches, New Signups This Month, Churned Churches. 12-month MRR/ARR trend line (crosshair + tooltip), new-signups-by-month bar chart, and a churn-rate gauge (healthy/elevated/high bands). Suspending a church now activates a read-only mode on the church-admin side: a persistent banner plus every interactive element outside Billing/Settings is disabled (ReadOnlyGate + GET /api/church/status) until the platform owner restores access.',
    href: '/superadmin',
  },
  {
    day: 'Day 44',
    date: '2026-07-23',
    title: 'Feature flags + church setup completion widget',
    status: 'complete',
    detail: '/superadmin/feature-flags: per-church table of every flag with an on/off toggle switch and a last-changed timestamp (GET/PATCH /api/superadmin/feature-flags). Turning off Communication Channels for a church hides Communication from its sidebar and blocks the page directly (useFeatureFlags/useFeatureFlag), and flows back the moment it is re-enabled. Church detail drawer gained a "Setup Completion" progress bar — % of onboarding steps done (denomination selected, logo uploaded, first member added, first event created, communication connected).',
    href: '/superadmin/feature-flags',
  },
  {
    day: 'Day 45',
    date: '2026-07-24',
    title: 'Geographic distribution map + support volume + activity feed',
    status: 'complete',
    detail: 'Superadmin dashboard: a simplified SVG Africa outline with a hoverable dot marker per church, projected from church_profiles.latitude/longitude (lib/geo.ts). Weekly support-ticket volume trend (opened vs. resolved, 2-series line with legend). "Recent Activity" feed of the latest signups, plan changes, suspensions/restores, and feature-flag changes across every church, newest first.',
    href: '/superadmin',
  },
  {
    day: 'Day 46',
    date: '2026-07-27',
    title: 'Team management + staff invitations',
    status: 'complete',
    detail: '/settings/team: staff list (name, role, last active, status) with a per-row role dropdown, and an "Invite Staff Member" modal. Invitations send a branded HTML email (church logo + accent color + "Accept Invitation" button) via Resend when configured, mock-sent otherwise. Public /invite/:token page — no login required — adds the person straight into the roster on accept. New church_custom_fields/staff_invitations tables and a church-scoped audit_log RLS policy (20260810_church_settings.sql).',
    href: '/settings/team',
  },
  {
    day: 'Day 47',
    date: '2026-07-28',
    title: 'Church branding + general settings',
    status: 'complete',
    detail: '/settings/branding: drag-and-drop (or click-to-browse) logo upload, accent-color picker (hex input + swatch), and a welcome-message textarea — saving broadcasts a church-branding-updated event so the sidebar logo and every var(--accent)-styled button update instantly, app-wide, with no reload. /settings/general: denomination, timezone, currency, and language, with denomination changes seeding a default ministry list per denomination (lib/church-branding.ts).',
    href: '/settings/branding',
  },
  {
    day: 'Day 48',
    date: '2026-07-29',
    title: 'Church-scoped audit log',
    status: 'complete',
    detail: '/settings/audit-log: filterable table (timestamp, user, action, resource) with an expandable row showing a before/after field diff, and a "Export CSV" button for compliance reporting. Wired into real mutations — editing a member, changing a member\'s status, changing a staff member\'s role, and updating branding/general settings all write a diffed entry via lib/church-store\'s addAuditEntry(). Added POST /api/events/:id (delete) with the same audit trail; no delete button is wired into the Events UI yet, so that path is API-only for now.',
    href: '/settings/audit-log',
  },
  {
    day: 'Day 49',
    date: '2026-07-30',
    title: 'Permission matrix + custom field builder + data export',
    status: 'complete',
    detail: '/settings/permissions: a 6-role × feature matrix derived live from lib/site.ts\'s sidebarItems role gates (not a hand-maintained duplicate), so it can\'t drift from what\'s actually enforced — click a cell to see the exact rule behind it. /settings/custom-fields: add/edit/delete text/number/date/dropdown/boolean fields, rendered dynamically on the member Add/Edit form. /settings/data-export: one .zip with members/households/attendance/events/giving CSVs (JSZip).',
    href: '/settings/permissions',
  },
  {
    day: 'Day 50',
    date: '2026-07-31',
    title: 'Branding live preview + onboarding checklist',
    status: 'complete',
    detail: 'Branding settings page gained a right-side live preview — a miniature sidebar/buttons/card rendered with the currently-edited (not-yet-saved) logo and color, updating on every keystroke. Dashboard gained an "Complete your setup — N of 7 steps done" checklist widget, each step computed from real state (profile, logo, branding, first member, first event, team invite, communication flag) rather than a stored flag.',
    href: '/dashboard',
  },
  {
    day: 'Day 51',
    date: '2026-08-03',
    title: 'Workbox service worker',
    status: 'complete',
    detail: 'public/sw.js loads Workbox via importScripts from its CDN (this project builds with Turbopack, and workbox-webpack-plugin — what next-pwa wraps — has no Turbopack equivalent yet; a service worker is a static file either way, so this works regardless of bundler). CacheFirst for images, StaleWhileRevalidate for hashed /_next/static/ assets, NetworkFirst with a 5s timeout for /api/* and page navigations, with an /offline.html fallback. Service worker registration + update lifecycle: a waiting new version now surfaces a real "Update available" toast (sonner) whose Reload button posts SKIP_WAITING and reloads once — this also required actually mounting <Toaster/>, which existed but was never rendered anywhere. New GET /api/health.',
    href: '/dashboard',
  },
  {
    day: 'Day 52',
    date: '2026-08-04',
    title: 'IndexedDB with Dexie',
    status: 'complete',
    detail: 'lib/db.ts: a Dexie database (members, events, attendanceSessions, messageDrafts, syncQueue), guarded against SSR and Safari-private-mode IndexedDB failures. On first admin-page load each session, OfflineSyncProvider fetches the first 500 members, all events, and recent attendance sessions into IndexedDB and shows an "Offline data ready" toast.',
    href: '/dashboard',
  },
  {
    day: 'Day 53',
    date: '2026-08-05',
    title: 'Offline check-in + sync queue',
    status: 'complete',
    detail: 'QRScanner now checks connectivity before every scan: offline, it looks the member up in IndexedDB, queues a check-in row in syncQueue, and shows "Checked in (will sync when online)" instead of hitting the network. A header SyncQueueBadge shows the pending count, animates while draining the queue, and shows a green "All synced" once it\'s empty — it drains automatically the moment connectivity returns (lib/offline-sync.ts processSyncQueue).',
    href: '/attendance/scan',
  },
  {
    day: 'Day 54',
    date: '2026-08-06',
    title: 'Offline detection service + banners',
    status: 'complete',
    detail: 'lib/connectivity.ts combines navigator.onLine (instant, but only reflects the network interface) with a 4s-timeout ping to /api/health every 30s (an interface can report "online" while this server is unreachable). A full-width "You are offline" banner appears app-wide, flips to a green "Back online" state for 2s after reconnecting, then disappears (useConnectivity). OfflinePageIndicator adds a small inline note on Dashboard and Attendance — the pages most dependent on live data — while offline.',
    href: '/dashboard',
  },
  {
    day: 'Day 55',
    date: '2026-08-07',
    title: 'Cross-browser + throttled-connection hardening',
    status: 'complete',
    detail: 'Defensive hardening pass: lib/db.ts now catches synchronous IndexedDB-open failures (Safari private browsing) instead of crashing; every push/install/service-worker API call was already feature-detected and try/caught. The NetworkFirst 5s timeout (Day 51) and the 4s-timeout health ping (Day 54) are the concrete responses to a throttled/Slow-3G connection — both fail over to cache/last-known-state instead of hanging. Real device/browser matrix testing (Safari iOS install + offline, Firefox service-worker support, actual DevTools network throttling) needs a real browser and isn\'t something this sandbox can execute — noted as a manual QA follow-up rather than claimed as done.',
    href: '/dashboard',
  },
  {
    day: 'Day 56',
    date: '2026-08-10',
    title: 'PWA install prompt + manifest',
    status: 'complete',
    detail: 'useInstallPrompt captures and defers beforeinstallprompt; a custom "Install App" button in the top nav only renders once that event has actually fired, so it\'s silently absent on Firefox/Safari (which never fire it) rather than a dead button. public/manifest.json: name/short_name, start_url, display: standalone, theme_color #1a4a2e, background_color #faf8f3, and 192px/512px/512px-maskable icons — real PNGs generated with a hand-rolled zlib-based encoder (no image-generation tool available), a simple white church glyph on the theme green.',
    href: '/dashboard',
  },
  {
    day: 'Day 57',
    date: '2026-08-11',
    title: 'react-virtual for long lists',
    status: 'complete',
    detail: 'Member Directory gained a "List (virtualized)" view (alongside the existing paginated card grid, left untouched) backed by @tanstack/react-virtual — plus a "Load 5,000 test members" button (a deterministic synthetic dataset from the mock API) to actually exercise scroll performance at scale, since the real mock roster is only 20 people. Attendance History\'s per-session check-in list and the Households list are now virtualized the same way — Households\' card grid became a single-column virtualized list with dynamic row measurement, since masonry-grid + virtualization is a poor combination.',
    href: '/members',
  },
  {
    day: 'Day 58',
    date: '2026-08-12',
    title: 'next/image audit + LCP pass',
    status: 'complete',
    detail: 'Converted the highest-traffic <img> usages to next/image with explicit dimensions and a shared blurDataURL placeholder: the shared Avatar primitive, the member directory card photo (fill + sizes, its wrapper already had the right aspect-ratio/position:relative), and the sidebar/top-nav avatars and church logo (the sidebar logo also gets priority as the one truly above-the-fold image on every page). next.config.mjs gained images.remotePatterns scoped to the Supabase Storage host and explicit compress: true. Left as plain <img> on purpose: the bulletin/invitation email HTML strings and the tracking pixel (can\'t be React there), and several lower-traffic modal/drawer photos not on the initial paint path. No Lighthouse/Semgrep/Snyk tooling is available in this sandbox to produce real scores — the config/component changes are the concrete, verifiable half of this task.',
    href: '/members',
  },
];

// ── Member types (Day 11) ─────────────────────────────────────────────────────

export type MemberStatus = 'active' | 'inactive' | 'visitor';

export type AgeGroup = 'child' | 'youth' | 'young_adult' | 'adult' | 'senior';

export type Member = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  status: MemberStatus;
  role: UserRole;
  ministries: string[];
  joinedDate: string;   // ISO date string YYYY-MM-DD
  ageGroup?: AgeGroup;  // Day 14
  zone?: string;        // Geographic zone — Day 14
  notes?: string;
};

// ── Mock member data — 20 realistic members for development ──────────────────

export const mockMembers: Member[] = [
  { id: 'm1',  fullName: 'Abena Mensah',       email: 'abena@elevanda.org',    phone: '+233 24 111 2233', status: 'active',   role: 'pastor',          ministries: ['Worship', 'Prayer'],             joinedDate: '2021-03-15', ageGroup: 'adult',       zone: 'North' },
  { id: 'm2',  fullName: 'Kwame Asante',        email: 'kwame@elevanda.org',    phone: '+233 20 234 5678', status: 'active',   role: 'ministry_leader', ministries: ['Youth', 'Evangelism'],           joinedDate: '2020-08-22', ageGroup: 'young_adult', zone: 'South' },
  { id: 'm3',  fullName: 'Ama Boateng',         email: 'ama@elevanda.org',      phone: '+233 26 345 6789', status: 'active',   role: 'staff',           ministries: ['Children', 'Admin'],             joinedDate: '2022-01-10', ageGroup: 'adult',       zone: 'East' },
  { id: 'm4',  fullName: 'Kofi Owusu',          email: 'kofi@elevanda.org',     phone: '+233 55 456 7890', status: 'visitor',  role: 'member',          ministries: [],                                joinedDate: '2024-04-01', ageGroup: 'youth',       zone: 'West' },
  { id: 'm5',  fullName: 'Efua Darko',          email: 'efua@elevanda.org',     phone: '+233 24 567 8901', status: 'active',   role: 'finance',         ministries: ['Finance', 'Admin'],              joinedDate: '2019-11-30', ageGroup: 'senior',      zone: 'North' },
  { id: 'm6',  fullName: 'Yaw Appiah',          email: 'yaw@elevanda.org',      phone: '+233 20 678 9012', status: 'active',   role: 'ministry_leader', ministries: ["Men's Ministry", 'Evangelism'],  joinedDate: '2021-06-18', ageGroup: 'adult',       zone: 'Central' },
  { id: 'm7',  fullName: 'Akosua Frimpong',     email: 'akosua@elevanda.org',   phone: '+233 26 789 0123', status: 'inactive', role: 'member',          ministries: ["Women's Ministry"],              joinedDate: '2018-02-14', ageGroup: 'senior',      zone: 'South' },
  { id: 'm8',  fullName: 'Nana Ama Tetteh',     email: 'nana@elevanda.org',     phone: '+233 55 890 1234', status: 'active',   role: 'staff',           ministries: ['Ushering', 'Hospitality'],       joinedDate: '2023-07-05', ageGroup: 'young_adult', zone: 'East' },
  { id: 'm9',  fullName: 'Kwabena Adjei',       email: 'kwabena@elevanda.org',  phone: '+233 24 901 2345', status: 'active',   role: 'member',          ministries: ['Choir', 'Worship'],              joinedDate: '2022-09-12', ageGroup: 'adult',       zone: 'West' },
  { id: 'm10', fullName: 'Adwoa Osei',          email: 'adwoa@elevanda.org',    phone: '+233 20 012 3456', status: 'visitor',  role: 'member',          ministries: [],                                joinedDate: '2024-05-20', ageGroup: 'youth',       zone: 'North' },
  { id: 'm11', fullName: 'Ekow Hammond',        email: 'ekow@elevanda.org',     phone: '+233 26 123 4567', status: 'active',   role: 'admin',           ministries: ['Leadership', 'Admin'],           joinedDate: '2017-01-01', ageGroup: 'adult',       zone: 'Central' },
  { id: 'm12', fullName: 'Maame Serwaa',        email: 'maame@elevanda.org',    phone: '+233 55 234 5678', status: 'active',   role: 'member',          ministries: ["Women's Ministry", 'Prayer'],    joinedDate: '2021-12-03', ageGroup: 'adult',       zone: 'South' },
  { id: 'm13', fullName: 'Fiifi Barimah',       email: 'fiifi@elevanda.org',    phone: '+233 24 345 6789', status: 'inactive', role: 'member',          ministries: ['Youth'],                         joinedDate: '2020-04-17', ageGroup: 'youth',       zone: 'East' },
  { id: 'm14', fullName: 'Esi Kyere',           email: 'esi@elevanda.org',      phone: '+233 20 456 7890', status: 'active',   role: 'ministry_leader', ministries: ['Children', 'Sunday School'],     joinedDate: '2019-08-25', ageGroup: 'young_adult', zone: 'West' },
  { id: 'm15', fullName: 'Kweku Annan',         email: 'kweku@elevanda.org',    phone: '+233 26 567 8901', status: 'active',   role: 'staff',           ministries: ['Media', 'Tech'],                 joinedDate: '2022-03-30', ageGroup: 'young_adult', zone: 'North' },
  { id: 'm16', fullName: 'Abeba Asiedu',        email: 'abeba@elevanda.org',    phone: '+233 55 678 9012', status: 'visitor',  role: 'member',          ministries: [],                                joinedDate: '2024-06-07', ageGroup: 'adult',       zone: 'Central' },
  { id: 'm17', fullName: 'Kojo Dankwa',         email: 'kojo@elevanda.org',     phone: '+233 24 789 0123', status: 'active',   role: 'member',          ministries: ['Choir', 'Worship'],              joinedDate: '2023-01-14', ageGroup: 'young_adult', zone: 'South' },
  { id: 'm18', fullName: 'Akua Gyamfi',         email: 'akua@elevanda.org',     phone: '+233 20 890 1234', status: 'active',   role: 'ministry_leader', ministries: ['Prayer', 'Intercession'],        joinedDate: '2020-10-09', ageGroup: 'adult',       zone: 'East' },
  { id: 'm19', fullName: 'Nii Teye Lartey',     email: 'nii@elevanda.org',      phone: '+233 26 901 2345', status: 'active',   role: 'finance',         ministries: ['Finance', 'Stewardship'],        joinedDate: '2021-05-22', ageGroup: 'senior',      zone: 'West' },
  { id: 'm20', fullName: 'Afia Boadu',          email: 'afia@elevanda.org',     phone: '+233 55 012 3456', status: 'inactive', role: 'member',          ministries: ["Women's Ministry"],              joinedDate: '2019-03-11', ageGroup: 'senior',      zone: 'Central' },
];

// ── Team pulse (populated from database in a later sprint) ───────────────────

export const teamPulse: { name: string; role: string; update: string }[] = [];

// ── Task board ────────────────────────────────────────────────────────────────

export const taskBoard = [
  {
    lane: 'Done',
    item: 'Timeline tab — chronological interactions, group joins, prayer requests, milestones.',
  },
  {
    lane: 'Done',
    item: 'Groups tab — memberships with join dates, type labels, and role badges (Leader/Co-leader/Member).',
  },
  {
    lane: 'Done',
    item: 'Notes tab — pastoral notes list with inline compose, visibility selector, optimistic add.',
  },
  {
    lane: 'Done',
    item: 'Quick actions upgraded: WhatsApp, Add Note, Prayer Request, Call, Email, Message.',
  },
  {
    lane: 'Next up',
    item: 'Configure NEXT_PUBLIC_SUPABASE_URL + ANON_KEY and run migrations (members, households, groups).',
  },
  {
    lane: 'Next up',
    item: 'Day 17 — CSV member import with 50-row test file and summary report.',
  },
];

// ── Quick links ───────────────────────────────────────────────────────────────

export const quickLinks = [
  { label: 'Register a church', href: '/onboarding',        description: 'Run the 6-step church registration wizard.' },
  { label: 'Profile settings',  href: '/settings/profile',  description: 'Update your name, photo, and password.' },
  { label: 'Sign in',           href: '/login',              description: 'Access your workspace with magic link or password.' },
];
