import TurndownService from "turndown"
import type { HTMLElement } from "node-html-parser"
import type { ImagesConfig } from "./types.js"

function publicUrlPrefix(publicDir: string): string {
  return publicDir.replace(/^\.\//, "").replace(/^public/, "")
}

export function createTurndown(images?: ImagesConfig): TurndownService {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  })

  if (images?.download) {
    const urlPrefix = publicUrlPrefix(images.publicDir)

    td.addRule("images", {
      filter: "img",
      replacement: (_content, node) => {
        const el = node as unknown as Element
        const isProcessed = el.getAttribute("data-skip")
        if (isProcessed === "true") return ""

        const alt = el.getAttribute("alt") ?? ""
        const slug = el.getAttribute("data-slug") ?? ""
        const src = el.getAttribute("data-original-src") ?? el.getAttribute("src") ?? ""
        const filename = src.split("/").pop() ?? ""
        const darkSrc = el.getAttribute("data-dark-src") ?? ""
        const basePath = `${urlPrefix}/${slug}/images`

        if (darkSrc) {
          const darkFilename = darkSrc.split("/").pop() ?? ""
          return `<Image light="${basePath}/${filename}" dark="${basePath}/${darkFilename}" alt="${alt.replace(/"/g, '\\"')}" />`
        }

        return `![${alt}](${basePath}/${filename})`
      },
    })
  }

  return td
}

export function findContent(page: HTMLElement, selector: string): HTMLElement | null {
  for (const sel of selector.split(",").map((s) => s.trim())) {
    const el = page.querySelector(sel)
    if (el) return el
  }
  return null
}
