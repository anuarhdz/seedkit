import { defineConfig } from "tsup"
import path from "node:path"

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    generate: "src/generate.ts",
    scrape: "src/scrape.ts",
    transform: "src/transform.ts",
    "generate-api": "src/generate-api.ts",
    "scrape-api": "src/scrape-api.ts",
    "transform-api": "src/transform-api.ts",
  },
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  splitting: false,
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
  noExternal: ["@seedkit/core"],
  external: ["@faker-js/faker", "node-html-parser", "turndown", "glob", "js-yaml", "zod", "jiti"],
  esbuildOptions(options) {
    options.alias = {
      "@seedkit/core": path.resolve("packages/core/src/index.ts"),
    }
  },
  async onSuccess() {
    const { chmod } = await import("node:fs/promises")
    await Promise.all(
      ["dist/cli.js", "dist/generate.js", "dist/scrape.js", "dist/transform.js"].map((f) =>
        chmod(f, 0o755),
      ),
    )
  },
})
