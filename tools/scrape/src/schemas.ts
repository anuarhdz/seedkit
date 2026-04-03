import { z } from "zod"
import { OutputConfigSchema } from "@seedkit/core"

const pattern = z.custom<RegExp>((val) => val instanceof RegExp, {
  message: "Must be a RegExp instance",
})

export const ScrapeSchemaFieldSchema = z.union([
  z.object({
    type: z.literal("selector"),
    selector: z.string().min(1),
    extract: z.literal("text"),
  }),
  z.object({
    type: z.literal("selector"),
    selector: z.string().min(1),
    extract: z.literal("attr"),
    attr: z.string().min(1),
  }),
  z.object({ type: z.literal("url-slug") }),
  z.object({ type: z.literal("nav-section") }),
  z.object({ type: z.literal("link-order") }),
  z.object({
    type: z.literal("static"),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
  z.object({
    type: z.literal("date"),
    selector: z.string().min(1),
  }),
  z.object({
    type: z.literal("richtext"),
    selector: z.string().min(1),
  }),
  z.object({
    type: z.literal("image"),
    selector: z.string().min(1),
  }),
])

export const FollowConfigSchema = z.union([
  z.object({
    type: z.literal("sitemap"),
    url: z.string().url(),
    pattern: pattern.optional(),
  }),
  z.object({
    type: z.literal("crawl").optional(),
    selector: z.string().min(1),
    baseUrl: z.string().url().optional(),
    pattern: pattern.optional(),
    sections: z
      .object({
        headingSelector: z.string().min(1),
        linksSelector: z.string().min(1),
      })
      .optional(),
  }),
])

export const ScrapeConfigSchema = z.object({
  startUrl: z.string().url(),
  follow: FollowConfigSchema,
  output: OutputConfigSchema,
  schema: z.record(ScrapeSchemaFieldSchema),
  content: z.object({ selector: z.string().min(1) }).optional(),
  images: z
    .object({
      download: z.boolean(),
      publicDir: z.string().min(1),
      lightDark: z.boolean().optional(),
    })
    .optional(),
  video: z
    .object({
      download: z.boolean(),
      outputDir: z
        .union([z.string(), z.function().args(z.string()).returns(z.string())])
        .optional(),
      urlBuilder: z.function().args(z.string()).returns(z.string()),
    })
    .optional(),
  delay: z.number().int().nonnegative().optional(),
})
