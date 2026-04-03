# Local setup

## Requirements

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)

## Install

```bash
pnpm install
```

This also runs `husky` to set up git hooks.

## Running tools

Each tool is driven by a config file you place in the directory where you want to run it.

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
```

You can also run tools directly from their package:

```bash
pnpm --filter @mdx-tools/generate dev
pnpm --filter @mdx-tools/scrape scrape
pnpm --filter @mdx-tools/transform transform
```

## Type checking

```bash
# Check all packages
pnpm typecheck

# Check a single package
pnpm --filter @mdx-tools/scrape typecheck
```

## Linting & formatting

```bash
pnpm lint           # Lint all files
pnpm lint:fix       # Fix lint issues
pnpm format         # Format all files
pnpm format:check   # Check formatting without writing
```

## Building

```bash
pnpm build          # Build all packages (tsc)
```

Tools run via `tsx` in development so a build step is not required day-to-day.

## Commit conventions

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new schema field type
fix: correct slug sanitization
chore: update dependencies
docs: update scrape README
```

The `commit-msg` hook enforces this automatically.
