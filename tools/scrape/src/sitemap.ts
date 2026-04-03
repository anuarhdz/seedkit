const MAX_DEPTH = 3
const FETCH_TIMEOUT_MS = 30_000

async function fetchXml(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Failed to fetch sitemap ${url}: ${res.status}`)
    return res.text()
  } finally {
    clearTimeout(timer)
  }
}

function extractLocs(xml: string): string[] {
  // Regex is intentionally used here: node-html-parser is HTML-focused and
  // may mangle XML namespace prefixes. Sitemap <loc> values are always plain
  // text, so a simple match is both safe and reliable.
  const matches = xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gs)
  return [...matches].map((m) => m[1]?.trim() ?? "").filter(Boolean)
}

function isSitemapIndex(xml: string): boolean {
  return xml.includes("<sitemapindex")
}

async function parseSitemap(
  xml: string,
  pattern: RegExp | undefined,
  depth: number,
): Promise<string[]> {
  if (depth > MAX_DEPTH) return []

  const locs = extractLocs(xml)

  if (isSitemapIndex(xml)) {
    const all: string[] = []
    for (const loc of locs) {
      const childXml = await fetchXml(loc)
      const childUrls = await parseSitemap(childXml, pattern, depth + 1)
      all.push(...childUrls)
    }
    return all
  }

  return pattern ? locs.filter((url) => pattern.test(url)) : locs
}

export async function discoverSitemapUrls(sitemapUrl: string, pattern?: RegExp): Promise<string[]> {
  console.log(`  Fetching sitemap: ${sitemapUrl}`)
  const xml = await fetchXml(sitemapUrl)
  return parseSitemap(xml, pattern, 0)
}
