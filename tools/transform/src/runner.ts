import { readFile, writeFile, mkdir } from "node:fs/promises"
import { relative, resolve, dirname } from "node:path"
import { glob } from "glob"
import { serializeToFrontmatter, serializeToMetadataExport } from "@seedkit/core"
import type { FieldEntry, SerializableRecord } from "@seedkit/core"
import { parseFile } from "./parser.js"
import { applyOperations } from "./transforms.js"
import type { TransformConfig } from "./types.js"

function buildRecord(fields: Record<string, unknown>): SerializableRecord {
  const record: SerializableRecord = {}
  for (const [key, value] of Object.entries(fields)) {
    const isDate = value instanceof Date
    const serializable = isDate ? (value as Date).toISOString() : value
    record[key] = { value: serializable as FieldEntry["value"], isDate }
  }
  return record
}

function getOutputPath(filePath: string, cwd: string, outputDir: string): string {
  const rel = relative(cwd, filePath)
  return resolve(outputDir, rel)
}

export async function run(config: TransformConfig): Promise<void> {
  const cwd = process.cwd()
  const files = await glob(config.input, { cwd, absolute: true })

  if (files.length === 0) {
    console.log(`No files matched: ${config.input}`)
    return
  }

  const dryRun = config.dryRun ?? false
  const modeLabel = dryRun ? " (dry run)" : ""
  console.log(`\n🔄 Transforming ${files.length} file(s)${modeLabel}\n`)

  let changed = 0
  let skipped = 0

  for (const filePath of files) {
    const content = await readFile(filePath, "utf8")
    const parsed = parseFile(content)

    if (!parsed) {
      console.log(`  ↷ skipped (unrecognized format): ${relative(cwd, filePath)}`)
      skipped++
      continue
    }

    const newFields = applyOperations(parsed.fields, config.operations)
    const targetFormat = config.output?.format ?? parsed.format

    const record = buildRecord(newFields)
    const header =
      targetFormat === "frontmatter"
        ? serializeToFrontmatter(record)
        : serializeToMetadataExport(record)

    const newContent = header + "\n" + parsed.body

    const destPath = config.output?.dir
      ? getOutputPath(filePath, cwd, resolve(cwd, config.output.dir))
      : filePath

    const relDest = relative(cwd, destPath)

    if (dryRun) {
      const formatNote = targetFormat !== parsed.format ? ` → ${targetFormat}` : ""
      console.log(`  ○ would write: ${relDest}${formatNote}`)
    } else {
      await mkdir(dirname(destPath), { recursive: true })
      await writeFile(destPath, newContent, "utf8")
      console.log(`  ✓ ${relDest}`)
    }

    changed++
  }

  const verb = dryRun ? "would transform" : "transformed"
  console.log(`\n✅ ${changed} file(s) ${verb}, ${skipped} skipped`)
}
