// --- Output ---

export interface OutputConfig {
  dir: string
  ext: "md" | "mdx"
  format: "frontmatter" | "metadata-export"
  structure: "flat" | "index"
}

// --- Schema fields ---

export interface SentenceField {
  type: "sentence"
  min?: number
  max?: number
}

export interface ParagraphField {
  type: "paragraph"
}

export interface DateField {
  type: "date"
  from?: string
  to?: string
}

export interface EnumField {
  type: "enum"
  values: readonly string[]
}

export interface EnumArrayField {
  type: "enum-array"
  pool: readonly string[]
  min?: number
  max?: number
}

export interface StaticField {
  type: "static"
  value: string | number | boolean
}

export interface SlugField {
  type: "slug"
  from: string
}

export interface ObjectField {
  type: "object"
  fields: Record<string, SchemaField>
}

export interface ImageField {
  type: "image"
  width?: number
  height?: number
}

export interface RichtextField {
  type: "richtext"
  headings?: boolean
  lists?: boolean
  bold?: boolean
  paragraphs?: { min?: number; max?: number }
}

export interface NumberField {
  type: "number"
  min?: number
  max?: number
  precision?: number
}

export interface BooleanField {
  type: "boolean"
  probability?: number
}

export type SchemaField =
  | SentenceField
  | ParagraphField
  | DateField
  | EnumField
  | EnumArrayField
  | StaticField
  | SlugField
  | ObjectField
  | ImageField
  | RichtextField
  | NumberField
  | BooleanField

// --- Collection ---

export interface BodyConfig {
  paragraphs?: {
    min?: number
    max?: number
  }
}

export interface CollectionConfig {
  name: string
  count?: number
  output: OutputConfig
  schema: Record<string, SchemaField>
  body?: BodyConfig
}

// --- Top-level config ---

export interface GenerateConfig {
  collections: CollectionConfig[]
}

export function defineConfig(config: GenerateConfig): GenerateConfig {
  return config
}

// --- Serializer internals ---

export type SerializableValue =
  | string
  | number
  | boolean
  | readonly SerializableValue[]
  | { [key: string]: SerializableValue }

export interface FieldEntry {
  value: SerializableValue
  isDate?: boolean
}

export type SerializableRecord = Record<string, FieldEntry>
