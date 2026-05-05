# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Nexus: Unified Subscription Manager for all Sandbox Group apps. Next.js 16 + React 19 app built with shadcn/ui (radix-nova style) on Tailwind v4.

## Documentation

- [Getting Started](docs/getting-started.md) — prerequisites, install, run, and common commands.
- [Architecture](docs/architecture.md) — stack, source layout, UI system, styling, theming, and conventions.

## Working Directory

The Next.js app lives in `src/` — not the repo root. Run all `bun` commands from `src/`, or use the repo-root `Makefile` wrappers (`make install`, `make run`, `make fmt`).
