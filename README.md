# seedkit

A pnpm monorepo of CLI tools for generating and transforming MDX content — primarily for demo data and local development.

## Quick start

```bash
npx seedkit generate
npx seedkit scrape
npx seedkit transform
```

Each command looks for a config file in the current directory.

## Packages

| Package              | Path              | Description                                       |
| -------------------- | ----------------- | ------------------------------------------------- |
| `@seedkit/core`      | `packages/core`   | Shared types, serializers, and file writer        |
| `@seedkit/generate`  | `tools/generate`  | Generate fake MDX files from a schema using Faker |
| `@seedkit/scrape`    | `tools/scrape`    | Scrape web pages and convert them to MDX          |
| `@seedkit/transform` | `tools/transform` | Batch-transform existing MDX frontmatter/metadata |

## Usage

Create a config file in your project directory and run with `npx`:

```bash
# Generate fake MDX files (requires generate.config.ts)
npx seedkit generate
npx seedkit generate --dry-run
npx seedkit generate --skip-existing

# Scrape web pages to MDX (requires scrape.config.ts)
npx seedkit scrape
npx seedkit scrape --dry-run

# Transform existing MDX files (requires transform.config.ts)
npx seedkit transform
npx seedkit transform --dry-run
```

## Config files

### generate.config.ts

```ts
import { defineConfig } from "seedkit/generate"

export default defineConfig({
  collections: [
    {
      name: "posts",
      count: 20,
      output: { dir: "content/posts", ext: "mdx", format: "frontmatter", structure: "index" },
      schema: {
        title: { type: "sentence", min: 4, max: 8 },
        date: { type: "date", from: "2023-01-01T00:00:00Z", to: "2025-12-31T23:59:59Z" },
        slug: { type: "slug", from: "title" },
      },
    },
  ],
})
```

### scrape.config.ts

```ts
import { defineConfig } from "seedkit/scrape"

export default defineConfig({
  startUrl: "https://example.com/docs",
  follow: { type: "sitemap", url: "https://example.com/sitemap.xml" },
  output: { dir: "./content/docs", ext: "mdx", format: "frontmatter", structure: "index" },
  schema: {
    title: { type: "selector", selector: "h1", extract: "text" },
    slug: { type: "url-slug" },
  },
})
```

### transform.config.ts

```ts
import { defineConfig } from "seedkit/transform"

export default defineConfig({
  input: "./content/**/*.mdx",
  operations: [
    { type: "rename-field", from: "publishedAt", to: "date" },
    { type: "add-field", key: "status", value: "published" },
    { type: "remove-field", key: "draft" },
  ],
})
```

## Requirements

- Node.js >= 18

> **TypeScript types in your editor:** Install `seedkit` as a dev dependency so your IDE resolves `defineConfig` imports in config files:
>
> ```bash
> pnpm add -D seedkit
> ```
>
> This is optional — the CLI works with `npx` without installing anything.

## Development

Clone the repo and install dependencies:

```bash
pnpm install
```

Run tools in development (using workspace packages directly):

```bash
pnpm generate   # requires generate.config.ts in cwd
pnpm scrape     # requires scrape.config.ts in cwd
pnpm transform  # requires transform.config.ts in cwd
```

```bash
pnpm typecheck    # type-check all packages
pnpm lint         # lint all files
pnpm build        # build the CLI dist
pnpm release      # bump version + generate changelog + tag
```

## Documentation

- [Local setup](./docs/guides/local-setup.md)
- [Roadmap](./docs/roadmap.md)
- [Architecture decisions](./docs/decisions/)
