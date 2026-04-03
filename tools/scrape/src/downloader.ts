import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import type { HTMLElement } from "node-html-parser"
import type { ImagesConfig, VideoConfig } from "./types.js"

function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url)
    return protocol === "http:" || protocol === "https:"
  } catch {
    return false
  }
}

export async function downloadFile(url: string, destPath: string): Promise<boolean> {
  if (!isSafeUrl(url)) {
    console.warn(`    Warning: Skipping unsafe URL: ${url}`)
    return false
  }
  try {
    console.log(`    Downloading: ${url.split("/").pop()}`)
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`    Warning: Failed to download ${url} (${res.status})`)
      return false
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    await writeFile(destPath, buffer)
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn(`    Warning: Error downloading ${url}: ${message}`)
    return false
  }
}

function getOriginalImageUrl(src: string, baseUrl: string): string {
  if (src.includes("/_next/image")) {
    try {
      const urlObj = new URL(src, baseUrl)
      const originalUrl = urlObj.searchParams.get("url")
      if (originalUrl) return originalUrl
    } catch {
      // URL parsing failed — fall through to default handling below
    }
  }
  if (src.startsWith("/")) return baseUrl + src
  return src
}

interface ImageInfo {
  img: HTMLElement
  originalUrl: string
  filename: string
}

export async function processImages(
  content: HTMLElement,
  slug: string,
  baseUrl: string,
  config: ImagesConfig,
): Promise<void> {
  const imagesDir = join(config.publicDir, slug, "images")
  await mkdir(imagesDir, { recursive: true })

  const images = content.querySelectorAll("img")
  const seenImages = new Set<string>()
  const allImages: ImageInfo[] = []

  for (const img of images) {
    const src = img.getAttribute("src")
    if (!src) continue
    const originalUrl = getOriginalImageUrl(src, baseUrl)
    const filename = decodeURIComponent((originalUrl.split("/").pop() ?? "").split("?")[0] ?? "")
    allImages.push({ img, originalUrl, filename })
  }

  for (let i = 0; i < allImages.length; i++) {
    const item = allImages[i]!
    const { img, originalUrl, filename } = item

    if (seenImages.has(filename)) continue
    seenImages.add(filename)

    img.setAttribute("data-original-src", originalUrl)
    img.setAttribute("data-slug", slug)
    await downloadFile(originalUrl, join(imagesDir, filename))

    if (config.lightDark && filename.includes(".light.") && i + 1 < allImages.length) {
      const darkCandidate = allImages[i + 1]!
      const expectedDark = filename.replace(".light.", ".dark.")

      if (darkCandidate.filename === expectedDark) {
        img.setAttribute("data-dark-src", darkCandidate.originalUrl)
        seenImages.add(darkCandidate.filename)
        darkCandidate.img.setAttribute("data-original-src", darkCandidate.originalUrl)
        await downloadFile(darkCandidate.originalUrl, join(imagesDir, darkCandidate.filename))
        darkCandidate.img.setAttribute("data-skip", "true")
      }
    }
  }
}

export async function downloadVideo(
  slug: string,
  config: VideoConfig,
  defaultDir: string,
): Promise<boolean> {
  const url = config.urlBuilder(slug)
  const destPath =
    typeof config.outputDir === "function"
      ? config.outputDir(slug)
      : join(config.outputDir ?? defaultDir, `${slug}.mp4`)
  await mkdir(dirname(destPath), { recursive: true })
  return downloadFile(url, destPath)
}
