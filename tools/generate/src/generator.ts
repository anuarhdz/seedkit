import { faker } from "@faker-js/faker"
import type { SchemaField, SerializableValue } from "@mdx-tools/core"
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
