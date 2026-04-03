import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { OutputConfig } from "./types.js"

export interface WriteFileOptions {
  slug: string
  header: string // serialized frontmatter or metadata-export block
  body: string
  output: OutputConfig
}

export async function writeContentFile(options: WriteFileOptions): Promise<void> {
  const { slug, header, body, output } = options
  const filename = `index.${output.ext}`

  let filePath: string
  let dir: string

  if (output.structure === "index") {
    dir = join(output.dir, slug)
    filePath = join(dir, filename)
  } else {
    dir = output.dir
    filePath = join(dir, `${slug}.${output.ext}`)
  }

  await mkdir(dir, { recursive: true })
  await writeFile(filePath, header + "\n" + body, "utf8")
}
