import TurndownService from "turndown"
import type { HTMLElement } from "node-html-parser"
import type { DiscoveredPage, ScrapeSchemaField } from "./types.js"

const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" })

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
      case "date": {
        const el = page.querySelector(field.selector)
        if (!el) {
          fields[key] = ""
          break
        }
        const raw = el.getAttribute("datetime") ?? el.text?.trim() ?? ""
        const parsed = new Date(raw)
        fields[key] = isNaN(parsed.getTime()) ? raw : parsed.toISOString()
        break
      }
      case "richtext": {
        const el = page.querySelector(field.selector)
        fields[key] = el ? td.turndown(el.outerHTML).trim() : ""
        break
      }
      case "image": {
        const el = page.querySelector(field.selector)
        if (!el) {
          fields[key] = { src: "", alt: "" }
          break
        }
        const src = el.getAttribute("src") ?? ""
        const result: Record<string, string | number> = {
          src: src.startsWith("/") ? new URL(src, baseUrl).href : src,
          alt: el.getAttribute("alt") ?? "",
        }
        const width = parseInt(el.getAttribute("width") ?? "", 10)
        const height = parseInt(el.getAttribute("height") ?? "", 10)
        if (!isNaN(width)) result.width = width
        if (!isNaN(height)) result.height = height
        fields[key] = result
        break
      }
    }
  }

  return fields
}
