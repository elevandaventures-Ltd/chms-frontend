# Elevanda Ventures — Frontend Baseline

This repository contains the Day 1 frontend baseline: a Next.js 14 App Router application using TypeScript, ESLint, and Prettier with simple UI scaffolding.

## Quick Scripts

- **Install:** npm install
- **Dev:** npm run dev (starts local server)
- **Build:** npm run build
- **Start (prod):** npm run start
- **Lint:** npm run lint
- **Typecheck:** npm run typecheck
- **Format (check):** npm run format
- **Format (write):** npm run format:write

## Environment

- **Template:** [.env.local.example](.env.local.example)
- **Local file:** [.env.local](.env.local) (update values for your machine)

## Path Aliases

- `@/components/*` -> `src/components/*`
- `@/lib/*` -> `src/lib/*`

## Status (Day-by-day)

- **Day 1 — Frontend baseline:** Completed. Next.js 14 App Router, TypeScript, ESLint, Prettier, path aliases, and `.env.local` are in place. Verified with `npm run typecheck`, `npm run lint`, and `npm run build`.

## Key Files

- Project manifest: [package.json](package.json)
- TypeScript config: [tsconfig.json](tsconfig.json)
- Root layout: [src/app/layout.tsx](src/app/layout.tsx)
- Home page: [src/app/page.tsx](src/app/page.tsx)
- Global styles: [src/app/globals.css](src/app/globals.css)
- Feature card: [src/components/FeatureCard.tsx](src/components/FeatureCard.tsx)
- Shared site data: [src/lib/site.ts](src/lib/site.ts)
- Env template: [.env.local.example](.env.local.example)
- Local env: [.env.local](.env.local)
