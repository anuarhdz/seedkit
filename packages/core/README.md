# @seedkit/core

Shared package used internally by all `@seedkit/*` tools. Provides types, serializers, and a file writer.

## Exports

### Types

```ts
import type {
  OutputConfig,
  SchemaField,
  CollectionConfig,
  GenerateConfig,
  SerializableRecord,
  FieldEntry,
} from "@seedkit/core"
```

#### `OutputConfig`

Controls where and how files are written.

```ts
interface OutputConfig {
  dir: string // Output directory
  ext: "md" | "mdx" // File extension
  format: "frontmatter" | "metadata-export" // Header format
  structure: "flat" | "index" // flat: slug.mdx, index: slug/index.mdx
}
```

#### `SchemaField`

Discriminated union of field types used by `@seedkit/generate`:

| type         | description                                       |
| ------------ | ------------------------------------------------- |
| `sentence`   | Random lorem sentence (`min`/`max` word count)    |
| `paragraph`  | Random lorem paragraph                            |
| `date`       | Random date between `from` and `to` (ISO strings) |
| `enum`       | Random value from `values[]`                      |
| `enum-array` | N random values from `pool[]` (`min`/`max` count) |
| `static`     | Fixed `value` (string, number, or boolean)        |
| `slug`       | Slugified value of another field (`from`)         |
| `object`     | Nested schema, recursed                           |

### Serializers

```ts
import { serializeToFrontmatter, serializeToMetadataExport } from "@seedkit/core"
```

- `serializeToFrontmatter(record)` → YAML frontmatter block (`---\n...\n---\n`)
- `serializeToMetadataExport(record)` → JS export (`export const metadata = { ... }\n`)

Both sanitize newlines in string values to prevent injection into the generated header.

### File writer

```ts
import { writeContentFile } from "@seedkit/core"

await writeContentFile({ slug, header, body, output })
```

Creates the output directory if needed and writes `header + "\n" + body` to the resolved path.

### Zod schemas

```ts
import { OutputConfigSchema } from "@seedkit/core"
```

Exported for use in tool-level config validators.

### `defineConfig`

```ts
import { defineConfig } from "@seedkit/core"
```

Identity helper for `generate.config.ts` — provides TypeScript inference with no runtime cost.
