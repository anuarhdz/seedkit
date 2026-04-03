import { access } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { join, resolve } from "node:path"
import { createJiti } from "jiti"
import { z } from "zod"
import { ScrapeConfigSchema } from "./schemas.js"
import type { ScrapeConfig } from "./types.js"

const ScrapeConfigOrArraySchema = z.union([ScrapeConfigSchema, z.array(ScrapeConfigSchema).min(1)])

export async function loadConfig(
  cwd: string,
  seedkitApiUrl?: URL,
  configFile?: string,
): Promise<ScrapeConfig | ScrapeConfig[]> {
  const configPath = configFile ? resolve(cwd, configFile) : resolve(join(cwd, "scrape.config.ts"))
  const configName = configFile ?? "scrape.config.ts"

  try {
    await access(configPath)
  } catch {
    throw new Error(
      `No ${configName} found in ${cwd}\n` +
        `Create one with:\n\n` +
        `  import { defineConfig } from "seedkit/scrape"\n\n` +
        `  export default defineConfig({ startUrl: "...", ... })\n`,
    )
  }

  const alias: Record<string, string> = seedkitApiUrl
    ? { "seedkit/scrape": fileURLToPath(seedkitApiUrl) }
    : {}
  const jiti = createJiti(import.meta.url, { alias })
  const mod = (await jiti.import(configPath)) as { default?: unknown }
  const result = ScrapeConfigOrArraySchema.safeParse(mod.default)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")} — ${i.message}`)
      .join("\n")
    throw new Error(`Invalid ${configName}:\n${issues}`)
  }

  return result.data as ScrapeConfig | ScrapeConfig[]
}
