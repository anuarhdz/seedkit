# mdx-cli-tools

A pnpm monorepo of CLI tools for generating and transforming MDX content — primarily for demo data and local development.

## Packages

| Package                | Path              | Description                                       |
| ---------------------- | ----------------- | ------------------------------------------------- |
| `@mdx-tools/core`      | `packages/core`   | Shared types, serializers, and file writer        |
| `@mdx-tools/generate`  | `tools/generate`  | Generate fake MDX files from a schema using Faker |
| `@mdx-tools/scrape`    | `tools/scrape`    | Scrape web pages and convert them to MDX          |
| `@mdx-tools/transform` | `tools/transform` | Batch-transform existing MDX frontmatter/metadata |

## Requirements

- Node.js >= 20
- pnpm >= 9

## Install

```bash
pnpm install
```

## Usage

Each tool is driven by a config file placed in the directory where you run the command.

```bash
# Generate fake MDX files (requires generate.config.ts in cwd)
pnpm generate

# Scrape web pages to MDX (requires scrape.config.ts in cwd)
pnpm scrape

# Transform existing MDX files (requires transform.config.ts in cwd)
pnpm transform
```

Flags:

```bash
pnpm generate -- --dry-run        # Preview files without writing
pnpm generate -- --skip-existing  # Skip files that already exist
pnpm scrape   -- --dry-run
pnpm scrape   -- --skip-existing
```

## Development

```bash
pnpm typecheck    # Type-check all packages
pnpm lint         # Lint all files
pnpm lint:fix     # Fix lint issues
pnpm format       # Format all files
pnpm build        # Build all packages
```

## Commit conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook enforces this automatically.

```
feat: add new schema field type
fix: correct slug sanitization
chore: update dependencies
docs: update scrape README
```

## Documentation

- [Local setup](./docs/guides/local-setup.md)
- [Architecture decisions](./docs/decisions/)
