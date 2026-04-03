import { z } from "zod"

const TransformOpSchema = z.union([
  z.object({ type: z.literal("rename-field"), from: z.string().min(1), to: z.string().min(1) }),
  z.object({
    type: z.literal("add-field"),
    key: z.string().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]),
    overwrite: z.boolean().optional(),
  }),
  z.object({ type: z.literal("remove-field"), key: z.string().min(1) }),
])

export const TransformConfigSchema = z.object({
  input: z.string().min(1),
  operations: z.array(TransformOpSchema).min(1),
  output: z
    .object({
      format: z.enum(["frontmatter", "metadata-export"]).optional(),
      dir: z.string().optional(),
    })
    .optional(),
  dryRun: z.boolean().optional(),
})
