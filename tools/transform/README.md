# @seedkit/transform

Batch-transforms MDX/MD files by renaming, adding, or removing frontmatter/metadata fields. Supports both `frontmatter` (YAML) and `metadata-export` (JS) formats and can convert between them.

## Usage

```bash
# Run via npx (no install required)
npx seedkit transform
npx seedkit transform --dry-run  # Preview changes without writing files

# Run from the monorepo
pnpm transform
```

## Config

Create a `transform.config.ts` in the directory where you want to run the command:

```ts
// transform.config.ts
import { defineConfig } from "seedkit/transform"

export default defineConfig({
  input: "./content/**/*.mdx",

  operations: [
    { type: "rename-field", from: "publishedAt", to: "date" },
    { type: "add-field", key: "status", value: "published" },
    { type: "add-field", key: "version", value: 2, overwrite: true },
    { type: "remove-field", key: "draft" },
  ],

  // Optional: write to a different directory instead of overwriting in place
  output: {
    dir: "./content-v2",
    format: "frontmatter", // convert format; omit to keep original
  },

  dryRun: false,
})
```

## Operations

Operations are applied in order to each file.

### `rename-field`

Renames a field key. Value is preserved as-is.

```ts
{ type: "rename-field", from: "publishedAt", to: "date" }
```

### `add-field`

Adds a field with a static value. By default skips if the key already exists.

```ts
{ type: "add-field", key: "status", value: "published" }
{ type: "add-field", key: "version", value: 2, overwrite: true }
```

### `remove-field`

Removes a field entirely.

```ts
{ type: "remove-field", key: "draft" }
```

## Format detection

Each file's format is detected automatically:

- **`frontmatter`** — file starts with `---`
- **`metadata-export`** — file starts with `export const metadata =`

Date values in `metadata-export` files (e.g. `new Date('...')`) are parsed and re-serialized correctly when converting formats.

## Output

By default, files are transformed in place. Use `output.dir` to write to a separate directory while preserving the relative path structure.

Use `output.format` to convert all files from one format to the other:

```ts
output: {
  dir: "./content-frontmatter",
  format: "frontmatter",
}
```
