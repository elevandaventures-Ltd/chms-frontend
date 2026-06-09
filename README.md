# Elevanda Ventures

Next.js App Router workspace for the Elevanda Ventures frontend tasks.

## What's Included

- [x] Day 1: baseline app setup with TypeScript, Prettier, path aliases, and environment files. — complete
- [x] Day 2: Tailwind CSS v3 + shadcn/ui + Radix UI installed; design token system (colors, fonts, spacing) in tailwind.config.ts; Google Fonts switched to Playfair Display (display) + Inter (body); typography scale in globals.css. — complete (2026-06-03)
- [x] Day 3: responsive workspace shell with a collapsible sidebar, top navigation, and sectioned dashboard content. — complete
- [x] Day 4: Storybook 8 component documentation plus reusable UI controls for buttons and form fields. — complete
- [x] Day 5: Modal, Drawer, Dropdown Menu, Toast (Sonner), Card, Badge, Avatar, and Skeleton components with Storybook stories. — complete (2026-05-31)
- [x] Day 6: login/signup screens, magic-link and password auth states, and Supabase client integration. — complete (2026-06-02)
- [x] Day 7: protected route middleware, Supabase session persistence with auto token refresh, and auth callback handler. — complete (2026-06-02)
- [x] Day 8: 5-step church onboarding wizard (name + logo, denomination, contact + address, review, done), React context state management, progress bar, step-back navigation, Supabase insert. — complete (2026-06-03)
- [x] Day 9: plan selection step (Community/Growth/Enterprise), review + confirm step, profile settings page with Supabase Storage avatar upload and password change. — complete (2026-06-04)
- [x] Day 10: admin layout with dark sidebar, breadcrumbs, role-aware navigation (Finance hidden for non-finance roles), auto-derived page titles, logout button in top bar. — complete (2026-06-05)
- [x] Day 11: Member Directory — masonry photo-card grid (2/3/4 column breakpoints), MemberCard with status badge + ministry tags, live search + status filter, members table SQL migration with RLS. — complete (2026-06-06)
- [x] Day 12: skeleton shimmer loading state, GET /api/members with search/filter/pagination, debounced search, error banner with retry, Pagination wired to directory. — complete (2026-06-07)

## Run It

Install dependencies once:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run Storybook:

```bash
npm run storybook
```

Build the app:

```bash
npm run build
```

Build Storybook:

```bash
npm run build-storybook
```

Type-check the project:

```bash
npm run typecheck
```

## Available Scripts

- `npm run dev` — start the Next.js dev server.
- `npm run build` — create a production build.
- `npm run start` — run the production server.
- `npm run storybook` — start Storybook for the UI components.
- `npm run build-storybook` — build the Storybook static site.
- `npm run typecheck` — run TypeScript type checking.
- `npm run lint` — placeholder lint script from the baseline.
- `npm run format` — check formatting.
- `npm run format:write` — write formatting changes.

## Project Structure

- [middleware.ts](middleware.ts) — Day 7 Edge middleware: redirects unauthenticated users to `/login`.
- [src/app/page.tsx](src/app/page.tsx) — Day 3 dashboard page.
- [src/app/login/page.tsx](src/app/login/page.tsx) — Day 6 login page (magic link + password).
- [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts) — Day 7 auth callback: exchanges PKCE code for a session cookie.
- [src/components/PageShell.tsx](src/components/PageShell.tsx) — shared page shell layout.
- [src/components/Sidebar.tsx](src/components/Sidebar.tsx) — collapsible navigation.
- [src/components/TopNav.tsx](src/components/TopNav.tsx) — top navigation bar.
- [src/components/ui/Button.tsx](src/components/ui/Button.tsx) — Day 4 button component.
- [src/components/ui/Input.tsx](src/components/ui/Input.tsx) — Day 4 input component.
- [src/components/ui/Textarea.tsx](src/components/ui/Textarea.tsx) — Day 4 textarea component.
- [src/components/ui/Select.tsx](src/components/ui/Select.tsx) — Day 4 select component.
- [src/components/ui/Checkbox.tsx](src/components/ui/Checkbox.tsx) — Day 4 checkbox component.
- [src/components/ui/Radio.tsx](src/components/ui/Radio.tsx) — Day 4 radio component.
- [src/components/ui/Modal.tsx](src/components/ui/Modal.tsx) — Day 5 modal component.
- [src/components/ui/Drawer.tsx](src/components/ui/Drawer.tsx) — Day 5 drawer component.
- [src/components/ui/Dropdown.tsx](src/components/ui/Dropdown.tsx) — Day 5 dropdown menu component.
- [src/components/ui/Toast.tsx](src/components/ui/Toast.tsx) — Day 5 toast provider (Sonner).
- [src/components/ui/Card.tsx](src/components/ui/Card.tsx) — Day 5 card component.
- [src/components/ui/Badge.tsx](src/components/ui/Badge.tsx) — Day 5 badge component.
- [src/components/ui/Avatar.tsx](src/components/ui/Avatar.tsx) — Day 5 avatar component.
- [src/components/ui/Skeleton.tsx](src/components/ui/Skeleton.tsx) — Day 5 skeleton loading component.
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts) — Day 7 browser Supabase client (persistSession, autoRefreshToken).
- [src/lib/supabase/server.ts](src/lib/supabase/server.ts) — Day 7 server Supabase client for middleware (cookie-based).
- [src/hooks/useSession.ts](src/hooks/useSession.ts) — Day 7 React hook: surfaces current session and re-renders on auth state changes.
- [src/app/onboarding/page.tsx](src/app/onboarding/page.tsx) — Day 8 onboarding wizard page (5 steps, React context).
- [src/context/OnboardingContext.tsx](src/context/OnboardingContext.tsx) — Day 8 wizard state: OnboardingProvider + useOnboarding hook.
- [src/components/onboarding/WizardShell.tsx](src/components/onboarding/WizardShell.tsx) — Day 8 progress bar, step pills, and navigation shell.
- [src/components/onboarding/Step1Identity.tsx](src/components/onboarding/Step1Identity.tsx) — Day 8 Step 1: church name + logo upload.
- [src/components/onboarding/Step2Denomination.tsx](src/components/onboarding/Step2Denomination.tsx) — Day 8 Step 2: denomination card-grid selector.
- [src/components/onboarding/Step3Contact.tsx](src/components/onboarding/Step3Contact.tsx) — Day 8 Step 3: contact details + address.
- [src/components/onboarding/Step4Review.tsx](src/components/onboarding/Step4Review.tsx) — Day 8 Step 4: review summary with edit shortcuts.
- [src/components/onboarding/Step5Done.tsx](src/components/onboarding/Step5Done.tsx) — Day 8 Step 5: success screen.
- [src/app/api/onboarding/route.ts](src/app/api/onboarding/route.ts) — Day 8 API: validates and inserts church record into Supabase.
- [.storybook/main.ts](.storybook/main.ts) — Storybook configuration.
- [.storybook/preview.tsx](.storybook/preview.tsx) — Storybook global preview setup.
- [.github/workflows/ci.yml](.github/workflows/ci.yml) — CI workflow for typecheck, build, and Storybook build.

## Authentication (Day 6 & 7)
### How the middleware works

Every request passes through `middleware.ts` at the Edge before reaching a page or API handler.

- **Public paths** (`/login`, `/signup`, `/auth/*`, `/api/auth/*`, Next.js internals) bypass auth entirely.
- **Protected paths** — the middleware calls `supabase.auth.getSession()` using the session cookie:
  - Session valid → request proceeds (Supabase refreshes the cookie if the token is near expiry).
  - No session → redirect to `/login?next=<original-path>` so the user lands back after signing in.

### Session persistence

The browser client (`src/lib/supabase/client.ts`) is configured with:

| Option | Value | Effect |
|---|---|---|
| `persistSession` | `true` | Session survives page reloads (stored in localStorage) |
| `autoRefreshToken` | `true` | JWT is silently refreshed before it expires |
| `detectSessionInUrl` | `true` | Magic-link and OAuth redirects are handled automatically |

The `useSession` hook (`src/hooks/useSession.ts`) hydrates from localStorage on first render and subscribes to `onAuthStateChange` so any component stays in sync with the latest auth state.

### Magic-link / OAuth callback

After a successful magic-link click Supabase redirects to `/auth/callback?code=<PKCE_code>`. The route handler in `src/app/auth/callback/route.ts` exchanges the code for a session cookie, then redirects the user to their intended destination.

**Supabase dashboard setup required:**

1. Authentication → URL Configuration → **Site URL**: `http://localhost:3000`
2. Authentication → URL Configuration → **Redirect URLs**: `http://localhost:3000/auth/callback`

## Environment

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

Required variables for auth (Days 6 & 7):

```text
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Find these in your Supabase project under **Settings → API**.

> The middleware fails open when these vars are absent so the app is still usable in dev, CI, and Storybook without credentials.

## Notes

- The app includes `allowedDevOrigins` in [next.config.mjs](next.config.mjs) so LAN access in dev is allowed from `192.168.1.9`.
- Generated build output such as `storybook-static` is ignored and should not be committed.
- **Status:** Days 1–12 are complete and pass TypeScript checks.

## Church Onboarding Wizard (Day 8)

Route: `/onboarding` — accessible without authentication (listed as a public path in middleware).

### Steps

| Step | Route segment | What it collects |
|---|---|---|
| 1 | Identity | Church name (required) + logo upload (optional, JPEG/PNG/SVG/WebP ≤ 2 MB) |
| 2 | Denomination | Visual card-grid selector with 12 presets + free-text "Other" fallback |
| 3 | Contact | Primary contact name, email, phone + full postal address |
| 4 | Review | Read-only summary of all steps with per-section edit shortcuts |
| 5 | Done | Success confirmation with a link back to the dashboard |

### Architecture

- **State** — `OnboardingProvider` (React context in `src/context/OnboardingContext.tsx`) holds all form data and exposes `patch`, `next`, `back`, `goTo` helpers. Zero external state libraries.
- **Shell** — `WizardShell` renders the animated progress bar (CSS width transition), clickable step pills for completed steps, and the step title/description header.
- **Navigation** — Back button always goes to the previous step. Completed step pills are clickable for direct jump. Step 4 has per-section edit buttons that call `goTo(n)`.
- **Validation** — Each step validates before advancing. Step 1 checks name length. Step 2 requires a selection. Step 3 validates email format, required fields, and phone pattern.
- **API** (`POST /api/onboarding`) — Validates the payload server-side, then upserts into the `churches` Supabase table. Falls back to a mock 201 response when Supabase env vars are absent so the wizard completes in dev.

### Supabase table

Run this migration in your Supabase SQL editor to create the required table:

```sql
create table if not exists public.churches (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  denomination  text not null,
  contact_name  text not null,
  contact_email text not null,
  contact_phone text,
  address_line1 text not null,
  address_line2 text,
  city          text not null,
  state         text not null,
  postal_code   text not null,
  country       text not null,
  created_at    timestamptz default now()
);

-- RLS: authenticated users can insert their own church record.
alter table public.churches enable row level security;

create policy "Allow insert for authenticated users"
  on public.churches for insert
  to authenticated
  with check (true);

-- RLS: each user can only read their own rows (cross-tenant isolation).
create policy "Users see only their own churches"
  on public.churches for select
  to authenticated
  using (contact_email = auth.jwt() ->> 'email');
```
