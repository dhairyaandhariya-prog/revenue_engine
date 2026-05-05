# Getting Started

## Prerequisites

Required:

- Node.js 22+
- [Bun](https://bun.sh) `1.3.12` (pinned in `src/package.json` via `packageManager`)

Optional for cloud infrastructure:

- Terraform 1.14+
- GCP credentials (`gcloud auth application-default login`)

## Working Directory

The Next.js app lives in `src/` — not the repo root. All `bun` commands run from `src/`. The repo-level `Makefile` wraps the common workflows so you can stay at the root.

## Install Dependencies

From the repo root:

```bash
make install
```

Or directly:

```bash
cd src
bun install
```

## Start the Dev Server

```bash
make run
```

Or directly:

```bash
cd src
bun run dev
```

The app boots on `http://localhost:3000` using `next dev --turbopack`.

## Common Commands

Run from `src/`:

```bash
bun run build          # production build
bun run start          # serve production build
bun run lint           # eslint (flat config in eslint.config.mjs)
bun run lint:fix       # eslint --fix
bun run typecheck      # tsc --noEmit
bun run format         # prettier --write "**/*.{ts,tsx}"
```

Run from repo root:

```bash
make fmt               # terraform fmt + prettier (root docs) + bun run format (src)
make infra-plan        # terraform plan via scripts/run_infra_updates.sh
make infra-apply       # terraform apply via scripts/run_infra_updates.sh
make clean             # clean terraform state artifacts
```

## Testing

No test runner is configured yet.
