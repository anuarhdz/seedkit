# 2026-04-01 — Initial tooling setup

## Status

Accepted

## Context

The project started as a collection of independent JS scripts for generating MDX content. As the toolset grows, a proper monorepo structure with shared tooling is needed.

## Decision

- **Monorepo with pnpm workspaces** — tools live under `tools/*`, each as an independent package sharing root devDependencies.
- **TypeScript** — all source files converted from `.js`/`.mjs` to `.ts`. Single `tsconfig.base.json` at root extended by each tool.
- **ESLint 9 flat config** (`eslint.config.js`) with `typescript-eslint` — single config at root covers all packages.
- **Prettier** — `singleQuote: false`, `semi: false`, `printWidth: 100`.
- **Commitlint** with `@commitlint/config-conventional` — enforces conventional commit format via the `commit-msg` Husky hook.
- **Husky hooks**:
  - `pre-commit`: lint-staged (ESLint + Prettier on staged files)
  - `commit-msg`: commitlint
  - `pre-push`: `pnpm typecheck` (runs `tsc --noEmit` across all packages)
- **tsx** for running scripts directly without a build step.

## Alternatives considered

- **npm/yarn workspaces** — pnpm preferred for disk efficiency and strict dependency resolution.
- **Biome** (instead of ESLint + Prettier) — rejected to keep flexibility for per-rule TypeScript linting.
- **Turborepo** — overkill at current scale; revisit if build pipelines grow.
