# Elevanda Ventures

Next.js App Router workspace for the Elevanda Ventures frontend tasks.

## What's Included

- [x] Day 1: baseline app setup with TypeScript, Prettier, path aliases, and environment files. — complete
- [x] Day 3: responsive workspace shell with a collapsible sidebar, top navigation, and sectioned dashboard content. — complete
- [x] Day 4: Storybook 8 component documentation plus reusable UI controls for buttons and form fields. — complete
- [x] Day 5: Modal, Drawer, Dropdown Menu, Toast (Sonner), Card, Badge, Avatar, and Skeleton components with Storybook stories. — complete (2026-05-31)
- [x] Day 6: login/signup screens, magic-link and password auth states, and Supabase client integration. — complete (2026-06-02)
- [x] Day 7: protected route middleware, Supabase session persistence with auto token refresh, and auth callback handler. — complete (2026-06-02)

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
- **Status:** Days 1, 3, 4, 5, 6, and 7 are complete and pass TypeScript checks.
