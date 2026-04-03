import { faker } from "@faker-js/faker"
import type { SchemaField, SerializableValue } from "@seedkit/core"
import { slugify } from "./slugify.js"

type ResolvedFields = Record<string, SerializableValue>

function generateField(field: SchemaField, resolved: ResolvedFields): SerializableValue {
  switch (field.type) {
    case "sentence":
      return faker.lorem.sentence({ min: field.min ?? 4, max: field.max ?? 10 })

    case "paragraph":
      return faker.lorem.paragraph()

    case "date": {
      const from = field.from ?? "2022-01-01T00:00:00Z"
      const to = field.to ?? new Date().toISOString()
      return faker.date.between({ from, to }).toISOString()
    }

    case "enum":
      return faker.helpers.arrayElement([...field.values])

    case "enum-array":
      return faker.helpers.arrayElements([...field.pool], {
        min: field.min ?? 1,
        max: field.max ?? 4,
      })

    case "static":
      return field.value

    case "slug": {
      const source = resolved[field.from]
      if (typeof source !== "string") {
        throw new Error(
          `slug field references "${field.from}" but that field is not a string or hasn't been resolved yet`,
        )
      }
      return slugify(source)
    }

    case "object":
      return generateFields(field.fields, resolved)

    case "image": {
      const width = field.width ?? 800
      const height = field.height ?? 600
      const seed = faker.string.alphanumeric(8)
      return {
        src: `https://picsum.photos/seed/${seed}/${width}/${height}`,
        width,
        height,
        alt: faker.lorem.words({ min: 2, max: 5 }),
      }
    }

    case "richtext": {
      const useHeadings = field.headings ?? true
      const useLists = field.lists ?? true
      const useBold = field.bold ?? true
      const count = faker.number.int({
        min: field.paragraphs?.min ?? 2,
        max: field.paragraphs?.max ?? 4,
      })
      const blocks: string[] = []

      if (useHeadings) {
        blocks.push(`## ${faker.lorem.words({ min: 3, max: 6 })}`)
        blocks.push("")
      }

      for (let i = 0; i < count; i++) {
        let paragraph = faker.lorem.paragraph({ min: 2, max: 4 })
        if (useBold && faker.datatype.boolean()) {
          const words = paragraph.split(" ")
          const idx = faker.number.int({ min: 0, max: words.length - 1 })
          words[idx] = `**${words[idx]!.replace(/[.,]$/, "")}**`
          paragraph = words.join(" ")
        }
        blocks.push(paragraph)
        blocks.push("")
      }

      if (useLists) {
        const itemCount = faker.number.int({ min: 2, max: 4 })
        for (let i = 0; i < itemCount; i++) {
          blocks.push(`- ${faker.lorem.sentence({ min: 3, max: 8 })}`)
        }
        blocks.push("")
      }

      return blocks.join("\n").trim()
    }

    case "number": {
      const min = field.min ?? 0
      const max = field.max ?? 100
      const precision = field.precision ?? 0
      if (precision === 0) return faker.number.int({ min, max })
      return faker.number.float({ min, max, fractionDigits: precision })
    }

    case "boolean":
      return faker.datatype.boolean({ probability: field.probability ?? 0.5 })
  }
}

export function generateFields(
  schema: Record<string, SchemaField>,
  resolved: ResolvedFields = {},
): ResolvedFields {
  const result: ResolvedFields = { ...resolved }

  // First pass: resolve all non-slug fields
  for (const [key, field] of Object.entries(schema)) {
    if (field.type === "slug") continue
    result[key] = generateField(field, result)
  }

  // Second pass: resolve slug fields (depend on other fields being ready)
  for (const [key, field] of Object.entries(schema)) {
    if (field.type !== "slug") continue
    result[key] = generateField(field, result)
  }

  return result
}
