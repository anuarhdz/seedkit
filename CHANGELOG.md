# Changelog

All notable changes to this project will be documented in this file.

## <small>0.1.2 (2026-04-03)</small>

- fix: derive image URL path from publicDir instead of hardcoding /content/ ([03cdb78](https://github.com/anuarhdz/seedkit/commit/03cdb78))

## <small>0.1.1 (2026-04-03)</small>

- feat: add --version / -v flag to CLI ([d6dd9b9](https://github.com/anuarhdz/seedkit/commit/d6dd9b9))
- feat: generate .d.ts declaration files for subpath exports ([1de21af](https://github.com/anuarhdz/seedkit/commit/1de21af))
- docs: add TypeScript IDE setup note to READMEs and roadmap ([5fcead3](https://github.com/anuarhdz/seedkit/commit/5fcead3))
- chore: add version flag to roadmap ([d5098d1](https://github.com/anuarhdz/seedkit/commit/d5098d1))

## 0.1.0 (2026-04-03)

- docs: update READMEs and guides for npx usage pattern ([d14c4a8](https://github.com/anuarhdz/seedkit/commit/d14c4a8))
- feat: add publishable CLI via tsup + jiti ([b6b1783](https://github.com/anuarhdz/seedkit/commit/b6b1783))
- chore: add label schema field - scrape ([91937f2](https://github.com/anuarhdz/seedkit/commit/91937f2))

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- pnpm monorepo with TypeScript strict mode, ESLint 9 flat config, Prettier, Commitlint, and Husky git hooks
- **`@seedkit/core`** — shared package with types, serializers, and file writer used by all tools
- **`@seedkit/generate`** — configurable fake MDX generator replacing three legacy tools (`mdx-cli`, `mdx-generator`, `next-mdx`)
- **`@seedkit/scrape`** — configurable web scraper with sitemap discovery, image/video download, and Zod config validation
- **`@seedkit/transform`** — batch-transform MDX frontmatter/metadata fields with format conversion support
- Root convenience scripts: `pnpm generate`, `pnpm scrape`, `pnpm transform`
- `--dry-run` and `--skip-existing` flags for `generate` and `scrape`
- Sitemap discovery in `scrape` (supports sitemap index recursion up to 3 levels)
- `VideoConfig.outputDir` accepts a function `(slug: string) => string` for full path control

### Security

- Slug sanitization: strips `..` and non-safe characters to prevent path traversal
- Newlines in scraped field values are collapsed before serialization (prevents frontmatter injection)
- Fetch requests abort after 30 seconds (prevents indefinite hangs)
- Downloader rejects non-`http(s)://` URLs (blocks `file://` and internal protocol abuse)

<details>
<summary>Implementation notes</summary>

- `@seedkit/core` is a workspace package consumed via `workspace:*` — no publishing required
- `tsx` runs all tools directly without a build step in development
- Zod v3 for config validation in `generate` and `scrape`; recursive schemas use `z.lazy()` with explicit `z.ZodType<T>` annotation
- Sitemap XML parsed with regex (`<loc>` extraction) instead of `node-html-parser` to avoid namespace mangling
- `metadata-export` format parsed with brace-counting + `vm.runInNewContext` (with `Date` injected into context)
- `VideoConfig.outputDir` as a function returns a full file path; as a string it's treated as a directory
- The three legacy generator tools (`mdx-cli`, `mdx-generator`, `next-mdx`) have been removed

</details>
