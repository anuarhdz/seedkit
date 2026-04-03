# @seedkit/scrape

Scrapes web pages and converts them to MDX files. Supports crawling by CSS selector or discovering pages from a sitemap. Useful for importing documentation, blogs, or course content as local MDX demo data.

## Usage

```bash
# Run via npx (no install required)
npx seedkit scrape
```

> **TypeScript types in your editor:** Install `seedkit` as a dev dependency so your IDE resolves the `defineConfig` import:
>
> ```bash
> pnpm add -D seedkit
> ```
>
> This is optional — the CLI works without it.

```bash
npx seedkit scrape --dry-run                      # Discover pages and preview output paths without fetching
npx seedkit scrape --skip-existing                # Skip pages whose output file already exists
npx seedkit scrape --config my.scrape.config.ts  # Use a custom config file
npx seedkit scrape --help                         # Show available options

# Run from the monorepo
pnpm scrape
```

## Config

Create a `scrape.config.ts` in the directory where you want the output:

```ts
// scrape.config.ts
import { defineConfig } from "seedkit/scrape"

export default defineConfig({
  startUrl: "https://example.com/docs",

  follow: {
    type: "crawl",
    selector: "nav a",
    baseUrl: "https://example.com",
    pattern: /\/docs\//,
  },

  output: {
    dir: "./content/docs",
    ext: "mdx",
    format: "frontmatter",
    structure: "index",
  },

  schema: {
    title: { type: "selector", selector: "h1", extract: "text" },
    slug: { type: "url-slug" },
    publishedAt: { type: "date", selector: "time" },
    cover: { type: "image", selector: "article img" },
  },

  content: {
    selector: "main",
  },

  delay: 500, // ms between requests
})
```

## Multiple sources

Export an array from the config file to scrape multiple sites in one run:

```ts
export default defineConfig([
  {
    startUrl: "https://site-a.com",
    follow: { type: "sitemap", url: "https://site-a.com/sitemap.xml" },
    output: { dir: "./content/site-a", ext: "mdx", format: "frontmatter", structure: "index" },
    schema: {
      title: { type: "selector", selector: "h1", extract: "text" },
      slug: { type: "url-slug" },
    },
  },
  {
    startUrl: "https://site-b.com",
    follow: { type: "sitemap", url: "https://site-b.com/sitemap.xml" },
    output: { dir: "./content/site-b", ext: "mdx", format: "frontmatter", structure: "index" },
    schema: {
      title: { type: "selector", selector: "h1", extract: "text" },
      slug: { type: "url-slug" },
    },
  },
])
```

Each config runs sequentially. You can also use `--config` to point to any named config file:

```bash
npx seedkit scrape --config scrape.blog.config.ts
npx seedkit scrape --config scrape.docs.config.ts
```

## Page discovery

### Crawl mode

Discovers URLs by parsing links on the start page.

```ts
follow: {
  type: "crawl",           // optional, default
  selector: "nav a",       // CSS selector for links
  baseUrl: "https://...",  // optional, defaults to startUrl origin
  pattern: /\/docs\//,     // optional URL filter
  sections: {              // optional: group pages by nav heading
    headingSelector: "nav h3",
    linksSelector: "a",
  },
}
```

### Sitemap mode

Discovers URLs from a `sitemap.xml`. Supports sitemap index files (recursive, up to 3 levels deep).

```ts
follow: {
  type: "sitemap",
  url: "https://example.com/sitemap.xml",
  pattern: /\/blog\//,  // optional URL filter
}
```

## Schema fields

Fields extracted from each page and written to the file header.

| type          | options                        | description                                                 |
| ------------- | ------------------------------ | ----------------------------------------------------------- |
| `selector`    | `selector`, `extract`, `attr?` | Extract `text` or an `attr` value via CSS selector          |
| `url-slug`    | —                              | Derived from the page URL path                              |
| `nav-section` | —                              | Section heading from the navigation (crawl + sections only) |
| `link-order`  | —                              | Position of the page within its section                     |
| `static`      | `value`                        | Fixed string, number, or boolean                            |
| `date`        | `selector`                     | Extract a date, returns ISO string                          |
| `richtext`    | `selector`                     | Extract HTML content, converted to markdown                 |
| `image`       | `selector`                     | Extract `{ src, width, height, alt }` from an `<img>`       |

### `date`

Finds the element and returns an ISO date string. Prefers the `datetime` attribute for `<time>` elements:

```ts
publishedAt: { type: "date", selector: "time.post-date" }
// → "2024-03-15T10:00:00.000Z"
```

### `richtext`

Extracts a section of the page as markdown. Useful for descriptions or sidebars that differ from the main body:

```ts
excerpt: { type: "richtext", selector: ".post-excerpt" }
```

### `image`

Extracts `src`, `alt`, and optionally `width`/`height` from an `<img>` element. Relative URLs are resolved against `baseUrl`:

```ts
cover: { type: "image", selector: "article img:first-child" }
```

```yaml
cover:
  src: https://example.com/images/cover.jpg
  alt: Cover image
  width: 1200
  height: 630
```

## Images

```ts
images: {
  download: true,
  publicDir: "./public/posts",  // images saved to publicDir/slug/images/
  lightDark: true,              // pair .light.png / .dark.png into <Image> components
}
```

Downloaded images are referenced in the body relative to the `publicDir` URL path. For example, with `publicDir: "./public/posts"`, images are served at `/posts/slug/images/filename.png`.

## Video

```ts
video: {
  download: true,
  urlBuilder: (slug) => `https://cdn.example.com/videos/${slug}.mp4`,

  // string: treated as directory, saves to dir/slug.mp4
  outputDir: "./public/videos",

  // function: full control over destination path
  outputDir: (slug) => `./public/${slug}/${slug}.mp4`,
}
```

## Config validation

The config is validated with Zod on load. Field-level errors are reported with their path:

```
Config error at follow.url: Invalid url
```

## Security

- URLs in the downloader are validated to be `http(s)://` before fetching (prevents `file://` or internal protocol abuse)
- Slugs derived from URLs are sanitized to strip `..` and non-safe characters (prevents path traversal)
- Fetch requests time out after 30 seconds
- Newlines in scraped field values are collapsed to a space before serialization (prevents frontmatter injection)
