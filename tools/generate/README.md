# @seedkit/generate

Generates fake MDX files from a schema using [Faker](https://fakerjs.dev/). Useful for seeding demo content in local development.

## Usage

```bash
# Run via npx (no install required)
npx seedkit generate
npx seedkit generate --dry-run        # Preview output paths without writing files
npx seedkit generate --skip-existing  # Skip files that already exist on disk

# Run from the monorepo
pnpm generate
```

## Config

Create a `generate.config.ts` in the directory where you want to run the command:

```ts
// generate.config.ts
import { defineConfig } from "seedkit/generate"

export default defineConfig({
  collections: [
    {
      name: "posts",
      count: 20,
      output: {
        dir: "content/posts",
        ext: "mdx",
        format: "metadata-export", // or "frontmatter"
        structure: "index", // slug/index.mdx — or "flat": slug.mdx
      },
      schema: {
        title: { type: "sentence", min: 4, max: 8 },
        summary: { type: "sentence", min: 10, max: 20 },
        date: { type: "date", from: "2023-01-01T00:00:00Z", to: "2025-12-31T23:59:59Z" },
        status: { type: "enum", values: ["draft", "published", "archived"] },
        tags: { type: "enum-array", pool: ["TypeScript", "React", "Next.js"], min: 1, max: 3 },
        slug: { type: "slug", from: "title" },
      },
      body: { paragraphs: { min: 2, max: 5 } },
    },
  ],
})
```

> When working inside the monorepo, you can also import from `@seedkit/core` instead of `seedkit/generate`.

## Schema field types

| type         | options                | description                      |
| ------------ | ---------------------- | -------------------------------- |
| `sentence`   | `min?`, `max?`         | Random lorem sentence            |
| `paragraph`  | —                      | Random lorem paragraph           |
| `date`       | `from?`, `to?`         | Random ISO date in range         |
| `enum`       | `values`               | Random item from list            |
| `enum-array` | `pool`, `min?`, `max?` | N random items from pool         |
| `static`     | `value`                | Fixed string, number, or boolean |
| `slug`       | `from`                 | Slugified value of another field |
| `object`     | `fields`               | Nested schema, recursed          |

`slug` fields are always resolved after all other fields, so `from` can reference any field in the same schema.

## Output formats

**`metadata-export`**

```mdx
export const metadata = {
  title: "Some Generated Title",
  date: new Date("2024-03-15T10:22:00.000Z"),
}

Body content here...
```

**`frontmatter`**

```mdx
---
title: Some Generated Title
date: "2024-03-15T10:22:00.000Z"
---

Body content here...
```

## Config validation

The config is validated with Zod on load. Field-level errors are reported with their path:

```
Config error at collections[0].schema.slug.from: Required
```
