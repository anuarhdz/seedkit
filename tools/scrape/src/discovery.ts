import { fetchHtml } from "./http.js"
import { discoverSitemapUrls } from "./sitemap.js"
import type { DiscoveredPage, FollowConfig } from "./types.js"

export async function discoverPages(
  startUrl: string,
  follow: FollowConfig,
): Promise<DiscoveredPage[]> {
  if (follow.type === "sitemap") {
    return discoverFromSitemap(follow.url, follow.pattern)
  }

  return discoverFromCrawl(startUrl, follow)
}

async function discoverFromSitemap(
  sitemapUrl: string,
  pattern?: RegExp,
): Promise<DiscoveredPage[]> {
  const urls = await discoverSitemapUrls(sitemapUrl, pattern)
  return urls.map((url, i) => ({ url, section: "", order: i + 1 }))
}

async function discoverFromCrawl(
  startUrl: string,
  follow: Exclude<FollowConfig, { type: "sitemap" }>,
): Promise<DiscoveredPage[]> {
  const baseUrl = follow.baseUrl ?? new URL(startUrl).origin
  const root = await fetchHtml(startUrl)
  const pages: DiscoveredPage[] = []
  const seen = new Set<string>()

  const isValid = (url: string): boolean =>
    url.startsWith(baseUrl) &&
    url !== baseUrl &&
    url !== baseUrl + "/" &&
    (!follow.pattern || follow.pattern.test(url))

  const toFullUrl = (href: string): string => (href.startsWith("http") ? href : baseUrl + href)

  if (follow.sections) {
    const { headingSelector, linksSelector } = follow.sections
    const headings = root.querySelectorAll(headingSelector)

    for (const heading of headings) {
      const section = heading.text.trim().split(":")[0]?.trim().toLowerCase() ?? ""
      const parent = heading.parentNode
      const links = parent.querySelectorAll(linksSelector)
      let sectionOrder = 0

      for (const link of links) {
        const href = link.getAttribute("href")
        if (!href || href.startsWith("#")) continue
        const fullUrl = toFullUrl(href)
        if (!isValid(fullUrl) || seen.has(fullUrl)) continue
        seen.add(fullUrl)
        sectionOrder++
        pages.push({ url: fullUrl, section, order: sectionOrder })
      }
    }
  } else {
    const links = root.querySelectorAll(follow.selector)
    let order = 0

    for (const link of links) {
      const href = link.getAttribute("href")
      if (!href || href.startsWith("#")) continue
      const fullUrl = toFullUrl(href)
      if (!isValid(fullUrl) || seen.has(fullUrl)) continue
      seen.add(fullUrl)
      order++
      pages.push({ url: fullUrl, section: "", order })
    }
  }

  return pages
}
