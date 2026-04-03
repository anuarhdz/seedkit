import { access, mkdir } from "node:fs/promises"
import { join } from "node:path"
import {
  serializeToFrontmatter,
  serializeToMetadataExport,
  writeContentFile,
} from "@mdx-tools/core"
import type { FieldEntry, OutputConfig, SerializableRecord } from "@mdx-tools/core"
import { discoverPages } from "./discovery.js"
import { deriveSlug, extractFields } from "./extractor.js"
import { downloadVideo, processImages } from "./downloader.js"
import { createTurndown, findContent } from "./content.js"
import { fetchHtml } from "./http.js"
import type { ScrapeConfig } from "./types.js"

export interface RunOptions {
  dryRun?: boolean
  skipExisting?: boolean
}

function buildRecord(fields: Record<string, unknown>): SerializableRecord {
  const record: SerializableRecord = {}
  for (const [key, value] of Object.entries(fields)) {
    record[key] = { value: value as FieldEntry["value"] }
  }
  return record
}

function getOutputPath(slug: string, output: OutputConfig): string {
  return output.structure === "index"
    ? join(output.dir, slug, `index.${output.ext}`)
    : join(output.dir, `${slug}.${output.ext}`)
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

export async function run(config: ScrapeConfig, options: RunOptions = {}): Promise<void> {
  const baseUrl =
    (config.follow.type !== "sitemap" ? config.follow.baseUrl : undefined) ??
    new URL(config.startUrl).origin
  const td = createTurndown(config.images)

  console.log("🔍 Discovering pages...\n")
  const pages = await discoverPages(config.startUrl, config.follow)
  console.log(`Found ${pages.length} pages:\n`)
  for (const p of pages) {
    const label = p.section ? `[${p.section}] ` : ""
    console.log(`  - ${label}${p.url}`)
  }

  if (options.dryRun) {
    console.log("\n(dry run) — would process:\n")
    for (const discovered of pages) {
      const slug = deriveSlug(discovered, baseUrl)
      const outputPath = getOutputPath(slug, config.output)
      console.log(`  ○ ${discovered.url} → ${outputPath}`)
    }
    console.log("\n✅ Done (dry run)")
    return
  }

  await mkdir(config.output.dir, { recursive: true })

  for (const discovered of pages) {
    const slug = deriveSlug(discovered, baseUrl)
    const outputPath = getOutputPath(slug, config.output)

    if (options.skipExisting && (await fileExists(outputPath))) {
      console.log(`\n↷ Skipped (exists): ${outputPath}`)
      continue
    }

    console.log(`\n📄 Processing: ${discovered.url}`)

    try {
      console.log(`  Fetching: ${discovered.url}`)
      const page = await fetchHtml(discovered.url)

      const fields = extractFields(page, config.schema, discovered, baseUrl)

      let videoDownloaded = false
      if (config.video?.download) {
        const videoDir = join(config.output.dir, slug)
        videoDownloaded = await downloadVideo(slug, config.video, videoDir)
      }

      const contentSelector = config.content?.selector ?? "main"
      const contentEl = findContent(page, contentSelector)

      if (config.images?.download && contentEl) {
        await processImages(contentEl, slug, baseUrl, config.images)
      }

      if (!contentEl) {
        console.warn(`  Warning: No content found at "${contentSelector}"`)
        await writeContentFile({
          slug,
          header: `# ${slug}\n\nNo content found.`,
          body: "",
          output: config.output,
        })
        continue
      }

      const body = td.turndown(contentEl.outerHTML)

      const metaFields: Record<string, unknown> = {}
      for (const [key, field] of Object.entries(config.schema)) {
        if (field.type === "url-slug") continue
        metaFields[key] = fields[key]
      }
      if (config.video) {
        metaFields["video"] = videoDownloaded ? `/${slug}.mp4` : false
      }

      const record = buildRecord(metaFields)
      const header =
        config.output.format === "frontmatter"
          ? serializeToFrontmatter(record)
          : serializeToMetadataExport(record)

      await writeContentFile({ slug, header, body, output: config.output })
      console.log(`  ✓ Saved: ${slug}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`  ✗ Error: ${message}`)
    }

    if (config.delay) {
      await new Promise<void>((r) => setTimeout(r, config.delay))
    }
  }

  console.log("\n✅ Done!")
}
