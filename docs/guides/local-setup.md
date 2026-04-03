# Local setup

## Requirements

- Node.js >= 18
- pnpm >= 9 (`npm install -g pnpm`)

## Install

```bash
pnpm install
```

This also runs `husky` to set up git hooks.

## Running tools

Each tool reads a config file from the current working directory.

```bash
# Generate fake MDX files (requires generate.config.ts in cwd)
pnpm generate

# Scrape web pages to MDX (requires scrape.config.ts in cwd)
pnpm scrape

# Transform existing MDX files (requires transform.config.ts in cwd)
pnpm transform
```

Available flags:

```bash
pnpm generate -- --dry-run        # Preview output without writing files
pnpm generate -- --skip-existing  # Skip files that already exist
pnpm scrape   -- --dry-run
pnpm scrape   -- --skip-existing
pnpm transform -- --dry-run
```

You can also run tools directly via their package filter:

```bash
pnpm --filter @seedkit/generate dev
pnpm --filter @seedkit/scrape scrape
pnpm --filter @seedkit/transform transform
```

## Config file imports

Inside the monorepo, config files can import from `@seedkit/core` (workspace package):

```ts
import { defineConfig } from "@seedkit/core" // generate
```

Outside the repo (external users via npx), use the published subpath exports:

```ts
import { defineConfig } from "seedkit/generate"
import { defineConfig } from "seedkit/scrape"
import { defineConfig } from "seedkit/transform"
```

## Building the CLI

```bash
pnpm build          # Compiles src/ → dist/ with tsup
pnpm build:packages # Builds individual tool packages (tsc)
```

## Type checking

```bash
pnpm typecheck              # Check root src/ + all packages
pnpm --filter @seedkit/scrape typecheck  # Single package
```

## Linting & formatting

```bash
pnpm lint           # Lint all files
pnpm lint:fix       # Fix lint issues
pnpm format         # Format all files
pnpm format:check   # Check formatting without writing
```

## Commit conventions

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new schema field type
fix: correct slug sanitization
chore: update dependencies
docs: update scrape README
```

The `commit-msg` hook enforces this automatically.

## Releasing

```bash
pnpm release          # Interactive — prompts for version bump
pnpm release:patch    # 0.0.1 → 0.0.2
pnpm release:minor    # 0.0.1 → 0.1.0
pnpm release:major    # 0.0.1 → 1.0.0
```

release-it reads conventional commits since the last tag, updates `CHANGELOG.md`, bumps `package.json`, and creates a git tag automatically.
