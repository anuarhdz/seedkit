import type { OutputConfig } from "@seedkit/core"

// --- Schema fields ---

export interface SelectorTextField {
  type: "selector"
  selector: string
  extract: "text"
}

export interface SelectorAttrField {
  type: "selector"
  selector: string
  extract: "attr"
  attr: string
}

export type SelectorField = SelectorTextField | SelectorAttrField

export interface UrlSlugField {
  type: "url-slug"
}

export interface NavSectionField {
  type: "nav-section"
}

export interface LinkOrderField {
  type: "link-order"
}

export interface StaticScrapeField {
  type: "static"
  value: string | number | boolean
}

export interface DateScrapeField {
  type: "date"
  selector: string
}

export interface RichtextScrapeField {
  type: "richtext"
  selector: string
}

export interface ImageScrapeField {
  type: "image"
  selector: string
}

export type ScrapeSchemaField =
  | SelectorField
  | UrlSlugField
  | NavSectionField
  | LinkOrderField
  | StaticScrapeField
  | DateScrapeField
  | RichtextScrapeField
  | ImageScrapeField

// --- Follow config ---

export interface SectionsConfig {
  headingSelector: string
  linksSelector: string
}

/** Crawl mode: discover URLs by parsing links on the start page */
export interface CrawlConfig {
  type?: "crawl"
  selector: string
  baseUrl?: string
  pattern?: RegExp
  sections?: SectionsConfig
}

/** Sitemap mode: discover URLs from a sitemap.xml (supports sitemap index) */
export interface SitemapConfig {
  type: "sitemap"
  url: string
  pattern?: RegExp
}

export type FollowConfig = CrawlConfig | SitemapConfig

// --- Assets config ---

export interface ImagesConfig {
  download: boolean
  publicDir: string
  lightDark?: boolean
}

export interface VideoConfig {
  download: boolean
  outputDir?: string | ((slug: string) => string)
  urlBuilder: (slug: string) => string
}

// --- Content config ---

export interface ContentConfig {
  selector: string
}

// --- Top-level config ---

export interface ScrapeConfig {
  startUrl: string
  follow: FollowConfig
  output: OutputConfig
  schema: Record<string, ScrapeSchemaField>
  content?: ContentConfig
  images?: ImagesConfig
  video?: VideoConfig
  delay?: number
}

// --- Discovery result ---

export interface DiscoveredPage {
  url: string
  section: string
  order: number
}

export function defineConfig(config: ScrapeConfig | ScrapeConfig[]): ScrapeConfig | ScrapeConfig[] {
  return config
}
