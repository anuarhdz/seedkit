import { defineConfig } from "./src/types.js"

// --- Example A: crawl mode (parses nav links on the start page) ---
export default defineConfig({
  startUrl: "https://compass.tailwindui.com/landscape-of-choice",

  follow: {
    type: "crawl",
    selector: "nav a[href]",
    baseUrl: "https://compass.tailwindui.com",
    sections: {
      headingSelector: "h2",
      linksSelector: "ul a[href]",
    },
  },

  output: {
    dir: "./output/content/posts",
    ext: "mdx",
    format: "frontmatter",
    structure: "index",
  },

  schema: {
    title: { type: "selector", selector: "h1", extract: "text" },
    label: { type: "selector", selector: "h1", extract: "text" },
    summary: {
      type: "selector",
      selector: 'meta[name="description"]',
      extract: "attr",
      attr: "content",
    },
    slug: { type: "url-slug" },
    module: { type: "nav-section" },
    order: { type: "link-order" },
  },

  content: { selector: "#content, article, main" },

  images: {
    download: true,
    publicDir: "./output/public/content",
    lightDark: true,
  },

  video: {
    download: true,
    outputDir: (slug) => `./output/public/videos/${slug}.mp4`,
    urlBuilder: (slug) => `https://assets.tailwindcss.com/templates/compass/${slug}.mp4`,
  },

  delay: 500,
})

// --- Example B: sitemap mode ---
//
// export default defineConfig({
//   startUrl: "https://example.com",
//
//   follow: {
//     type: "sitemap",
//     url: "https://example.com/sitemap.xml",
//     pattern: /\/docs\//,          // optional: only scrape /docs/* URLs
//   },
//
//   output: {
//     dir: "./content/docs",
//     ext: "mdx",
//     format: "frontmatter",
//     structure: "index",
//   },
//
//   schema: {
//     title:   { type: "selector", selector: "h1", extract: "text" },
//     summary: { type: "selector", selector: 'meta[name="description"]', extract: "attr", attr: "content" },
//     slug:    { type: "url-slug" },
//   },
//
//   content: { selector: "main" },
//   delay: 300,
// })
