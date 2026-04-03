import type { HTMLElement } from "node-html-parser"
import type { DiscoveredPage, ScrapeSchemaField } from "./types.js"

export function deriveSlug(discovered: DiscoveredPage, baseUrl: string): string {
  const raw = discovered.url.replace(baseUrl + "/", "").replace(/\//g, "-") || "index"
  // Strip path traversal sequences and any characters outside safe slug chars
  return (
    raw
      .split("-")
      .map((segment) => segment.replace(/\.\./g, "").replace(/[^a-zA-Z0-9._~-]/g, ""))
      .filter(Boolean)
      .join("-") || "index"
  )
}

export function extractFields(
  page: HTMLElement,
  schema: Record<string, ScrapeSchemaField>,
  discovered: DiscoveredPage,
  baseUrl: string,
): Record<string, unknown> {
  const fields: Record<string, unknown> = {}

  for (const [key, field] of Object.entries(schema)) {
    switch (field.type) {
      case "selector": {
        const el = page.querySelector(field.selector)
        if (field.extract === "text") {
          fields[key] = el?.text?.trim() ?? ""
        } else {
          fields[key] = el?.getAttribute(field.attr) ?? ""
        }
        break
      }
      case "url-slug": {
        fields[key] = deriveSlug(discovered, baseUrl)
        break
      }
      case "nav-section": {
        fields[key] = discovered.section
        break
      }
      case "link-order": {
        fields[key] = discovered.order
        break
      }
      case "static": {
        fields[key] = field.value
        break
      }
    }
  }

  return fields
}
