import { parse } from "node-html-parser"
import type { HTMLElement } from "node-html-parser"

const FETCH_TIMEOUT_MS = 30_000

export async function fetchHtml(url: string): Promise<HTMLElement> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
    return parse(await res.text())
  } finally {
    clearTimeout(timer)
  }
}
