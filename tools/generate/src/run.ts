import { access } from "node:fs/promises"
import { join } from "node:path"
import { faker } from "@faker-js/faker"
import { serializeToFrontmatter, serializeToMetadataExport, writeContentFile } from "@seedkit/core"
import type {
  CollectionConfig,
  FieldEntry,
  GenerateConfig,
  OutputConfig,
  SerializableRecord,
} from "@seedkit/core"
import { generateFields } from "./generator.js"

export interface RunOptions {
  dryRun?: boolean
  skipExisting?: boolean
}

function buildSerializableRecord(
  fields: Record<string, unknown>,
  schema: CollectionConfig["schema"],
): SerializableRecord {
  const record: SerializableRecord = {}
  for (const [key, value] of Object.entries(fields)) {
    const fieldDef = schema[key]
    const isDate = fieldDef?.type === "date"
    record[key] = { value: value as FieldEntry["value"], isDate }
  }
  return record
}

function findSlugKey(schema: CollectionConfig["schema"]): string | null {
  for (const [key, field] of Object.entries(schema)) {
    if (field.type === "slug") return key
  }
  return null
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

async function runCollection(collection: CollectionConfig, options: RunOptions): Promise<void> {
  const count = collection.count ?? 10
  const slugKey = findSlugKey(collection.schema)
  const used = new Set<string>()
  const created: string[] = []

  const modeLabel = options.dryRun ? " (dry run)" : ""
  console.log(`\n📁 Collection: ${collection.name} (${count} files)${modeLabel}`)

  while (created.length < count) {
    const fields = generateFields(collection.schema)

    const slug =
      slugKey && typeof fields[slugKey] === "string"
        ? (fields[slugKey] as string)
        : faker.lorem.slug(3)

    if (used.has(slug)) continue
    used.add(slug)

    const outputPath = getOutputPath(slug, collection.output)

    if (options.skipExisting && (await fileExists(outputPath))) {
      console.log(`  ↷ skipped (exists): ${outputPath}`)
      created.push(outputPath)
      continue
    }

    // Exclude the slug field — used for filename only
    const recordFields: typeof fields = {}
    for (const [k, v] of Object.entries(fields)) {
      if (k === slugKey) continue
      recordFields[k] = v
    }

    const record = buildSerializableRecord(recordFields, collection.schema)
    const header =
      collection.output.format === "frontmatter"
        ? serializeToFrontmatter(record)
        : serializeToMetadataExport(record)

    const bodyParagraphs = collection.body?.paragraphs
    const body = faker.lorem.paragraphs({
      min: bodyParagraphs?.min ?? 1,
      max: bodyParagraphs?.max ?? 3,
    })

    if (options.dryRun) {
      console.log(`  ○ would write: ${outputPath}`)
    } else {
      await writeContentFile({ slug, header, body, output: collection.output })
      console.log(`  • ${outputPath}`)
    }

    created.push(outputPath)
  }

  const verb = options.dryRun ? "would write" : "written"
  console.log(`  ✅ ${created.length} files ${verb}`)
}

export async function run(config: GenerateConfig, options: RunOptions = {}): Promise<void> {
  for (const collection of config.collections) {
    await runCollection(collection, options)
  }
}
