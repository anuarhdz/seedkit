export type TransformOp =
  | { type: "rename-field"; from: string; to: string }
  | { type: "add-field"; key: string; value: string | number | boolean; overwrite?: boolean }
  | { type: "remove-field"; key: string }
  | { type: "transform-value"; key: string; fn: (value: unknown) => unknown }
  | {
      type: "set-field-if"
      key: string
      value: string | number | boolean
      when: { field: string; equals: string | number | boolean }
    }

export interface TransformOutput {
  /** Change the output format. If omitted, keeps the original file's format. */
  format?: "frontmatter" | "metadata-export"
  /** Write transformed files here instead of overwriting in-place. */
  dir?: string
}

export interface TransformConfig {
  /** Glob pattern for input files, e.g. "./content/**\/*.mdx" */
  input: string
  operations: TransformOp[]
  output?: TransformOutput
  dryRun?: boolean
}

export type DetectedFormat = "frontmatter" | "metadata-export"

export interface ParsedFile {
  format: DetectedFormat
  fields: Record<string, unknown>
  body: string
}

export function defineConfig(config: TransformConfig): TransformConfig {
  return config
}
