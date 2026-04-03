import { defineConfig } from "@seedkit/core"

export default defineConfig({
  collections: [
    {
      name: "posts",
      count: 3,
      output: {
        dir: "./output/content/posts",
        ext: "mdx",
        format: "frontmatter",
        structure: "index",
      },
      schema: {
        title: { type: "sentence", min: 4, max: 8 },
        date: { type: "date", from: "2022-01-01T00:00:00Z", to: "2025-12-31T00:00:00Z" },
        tags: {
          type: "enum-array",
          pool: ["TypeScript", "React", "Next.js", "Astro", "Tailwind CSS"],
          min: 2,
          max: 3,
        },
        draft: { type: "static", value: true },
        slug: { type: "slug", from: "title" },
      },
      body: { paragraphs: { min: 1, max: 2 } },
    },
  ],
})
