# Elevanda Ventures

Next.js App Router workspace for the Elevanda Ventures frontend tasks.

## What’s Included

- Day 1: baseline app setup with TypeScript, Prettier, path aliases, and environment files.
- Day 3: responsive workspace shell with a collapsible sidebar, top navigation, and sectioned dashboard content.
- Day 4: Storybook 8 component documentation plus reusable UI controls for buttons and form fields.
- Day 5: Modal, Drawer, Dropdown Menu, Toast (Sonner), Card, Badge, Avatar, and Skeleton components with Storybook stories.
 - Day 6: login and signup flows with magic-link and password-based auth, plus Supabase-backed client auth setup.
 - [x] Day 1: baseline app setup with TypeScript, Prettier, path aliases, and environment files. — complete
 - [x] Day 3: responsive workspace shell with a collapsible sidebar, top navigation, and sectioned dashboard content. — complete
 - [x] Day 4: Storybook 8 component documentation plus reusable UI controls for buttons and form fields. — complete
 - [x] Day 5: Modal, Drawer, Dropdown Menu, Toast (Sonner), Card, Badge, Avatar, and Skeleton components with Storybook stories. — complete (2026-05-31)
 - [x] Day 6: login/signup screens, auth states, and Supabase client integration. — complete (2026-06-02)

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

- `npm run dev` - start the Next.js dev server.
- `npm run build` - create a production build.
- `npm run start` - run the production server.
- `npm run storybook` - start Storybook for the UI components.
- `npm run build-storybook` - build the Storybook static site.
- `npm run typecheck` - run TypeScript type checking.
- `npm run lint` - placeholder lint script from the baseline.
- `npm run format` - check formatting.
- `npm run format:write` - write formatting changes.

## Project Structure

- [src/app/page.tsx](src/app/page.tsx) - Day 3 dashboard page.
- [src/components/PageShell.tsx](src/components/PageShell.tsx) - shared page shell layout.
- [src/components/Sidebar.tsx](src/components/Sidebar.tsx) - collapsible navigation.
- [src/components/TopNav.tsx](src/components/TopNav.tsx) - top navigation bar.
- [src/components/ui/Button.tsx](src/components/ui/Button.tsx) - Day 4 button component.
- [src/components/ui/Input.tsx](src/components/ui/Input.tsx) - Day 4 input component.
- [src/components/ui/Textarea.tsx](src/components/ui/Textarea.tsx) - Day 4 textarea component.
- [src/components/ui/Select.tsx](src/components/ui/Select.tsx) - Day 4 select component.
- [src/components/ui/Checkbox.tsx](src/components/ui/Checkbox.tsx) - Day 4 checkbox component.
- [src/components/ui/Radio.tsx](src/components/ui/Radio.tsx) - Day 4 radio component.
 - [src/components/ui/Modal.tsx](src/components/ui/Modal.tsx) - Day 5 modal component.
 - [src/components/ui/Drawer.tsx](src/components/ui/Drawer.tsx) - Day 5 drawer component.
 - [src/components/ui/Dropdown.tsx](src/components/ui/Dropdown.tsx) - Day 5 dropdown menu component.
 - [src/components/ui/Toast.tsx](src/components/ui/Toast.tsx) - Day 5 toast provider (Sonner).
 - [src/components/ui/Card.tsx](src/components/ui/Card.tsx) - Day 5 card component.
 - [src/components/ui/Badge.tsx](src/components/ui/Badge.tsx) - Day 5 badge component.
 - [src/components/ui/Avatar.tsx](src/components/ui/Avatar.tsx) - Day 5 avatar component.
 - [src/components/ui/Skeleton.tsx](src/components/ui/Skeleton.tsx) - Day 5 skeleton loading component.
- [.storybook/main.ts](.storybook/main.ts) - Storybook configuration.
- [.storybook/preview.tsx](.storybook/preview.tsx) - Storybook global preview setup.
- [.github/workflows/ci.yml](.github/workflows/ci.yml) - CI workflow for typecheck, build, and Storybook build.

## Environment

- [`.env.local.example`](.env.local.example) shows the expected local environment shape.
- [`.env.local`](.env.local) is your machine-specific file.
- Day 6 auth expects `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

## Notes

- The app includes `allowedDevOrigins` in [next.config.mjs](next.config.mjs) so LAN access in dev is allowed from `192.168.1.9`.
- Generated build output such as `storybook-static` is ignored and should not be committed.

- **Status:** Day 1, 3, 4, 5, and 6 implementations are present in the repo and pass TypeScript checks and the production build. Day 6 uses Supabase client auth for login, signup, and magic-link flows.
