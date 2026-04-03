import { z } from "zod"
import type { SchemaField } from "./types.js"

export const OutputConfigSchema = z.object({
  dir: z.string().min(1),
  ext: z.enum(["md", "mdx"]),
  format: z.enum(["frontmatter", "metadata-export"]),
  structure: z.enum(["flat", "index"]),
})

// Recursive type — z.lazy() is required for the "object" variant
export const SchemaFieldSchema: z.ZodType<SchemaField> = z.lazy(() =>
  z.union([
    z.object({
      type: z.literal("sentence"),
      min: z.number().int().positive().optional(),
      max: z.number().int().positive().optional(),
    }),
    z.object({ type: z.literal("paragraph") }),
    z.object({
      type: z.literal("date"),
      from: z.string().optional(),
      to: z.string().optional(),
    }),
    z.object({ type: z.literal("enum"), values: z.array(z.string()).min(1) }),
    z.object({
      type: z.literal("enum-array"),
      pool: z.array(z.string()).min(1),
      min: z.number().int().positive().optional(),
      max: z.number().int().positive().optional(),
    }),
    z.object({
      type: z.literal("static"),
      value: z.union([z.string(), z.number(), z.boolean()]),
    }),
    z.object({ type: z.literal("slug"), from: z.string().min(1) }),
    z.object({
      type: z.literal("object"),
      fields: z.record(SchemaFieldSchema),
    }),
    z.object({
      type: z.literal("image"),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    }),
    z.object({
      type: z.literal("richtext"),
      headings: z.boolean().optional(),
      lists: z.boolean().optional(),
      bold: z.boolean().optional(),
      paragraphs: z
        .object({
          min: z.number().int().positive().optional(),
          max: z.number().int().positive().optional(),
        })
        .optional(),
    }),
    z.object({
      type: z.literal("number"),
      min: z.number().optional(),
      max: z.number().optional(),
      precision: z.number().int().nonnegative().optional(),
    }),
    z.object({
      type: z.literal("boolean"),
      probability: z.number().min(0).max(1).optional(),
    }),
  ]),
)

export const CollectionConfigSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().positive().optional(),
  output: OutputConfigSchema,
  schema: z.record(SchemaFieldSchema),
  body: z
    .object({
      paragraphs: z
        .object({
          min: z.number().int().positive().optional(),
          max: z.number().int().positive().optional(),
        })
        .optional(),
    })
    .optional(),
})

export const GenerateConfigSchema = z.object({
  collections: z.array(CollectionConfigSchema).min(1),
})
