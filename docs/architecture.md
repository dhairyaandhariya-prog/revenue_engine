# Architecture

Nexus is the Unified Subscription Manager for all Sandbox Group apps. It is a Next.js 16 + React 19 application built with shadcn/ui (radix-nova style) on Tailwind v4.

## Stack

- **Next.js App Router** (`src/app/`) with React Server Components (`rsc: true` in `components.json`).
- **React 19** with TypeScript strict mode.
- **Package manager**: [Bun](https://bun.sh) (`packageManager` pinned in `src/package.json`).

## Source Layout

The Next.js app lives in `src/`. The repo root holds infrastructure (`iac/`), scripts (`scripts/`), docs (`docs/`), and the `Makefile` entrypoint.

- **Path alias**: `@/*` → `src/*` (see `src/tsconfig.json`). Import via `@/components`, `@/lib/utils`, `@/hooks`, `@/components/ui`.

## UI System

- **shadcn/ui** configured with `style: radix-nova`, `baseColor: mist`, icons via `lucide-react`.
- Add components via `bunx shadcn@latest add <name>` — they land in `src/components/ui/`. Do not hand-edit `components.json`; always use the CLI so aliases and style stay consistent.

## Styling

- **Tailwind v4** via `@tailwindcss/postcss`; global styles and design tokens in `src/app/globals.css`.
- `tw-animate-css` is available for animation utilities.
- Prettier uses `prettier-plugin-tailwindcss` for class sorting.

## Theming

- `next-themes` wired via `src/components/theme-provider.tsx`.

## Utilities

- `cn()` helper in `src/lib/utils.ts` (clsx + tailwind-merge).

## Conventions

- TypeScript strict mode is on; keep it on.
- Prefer shadcn primitives and `cn()` over ad-hoc class concatenation.
- When adding a new shadcn component, use the CLI so `components.json` aliases and style stay consistent.
