import { access } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { join, resolve } from "node:path"
import { createJiti } from "jiti"
import { GenerateConfigSchema } from "@seedkit/core"
import type { GenerateConfig } from "@seedkit/core"

export async function loadConfig(
  cwd: string,
  seedkitApiUrl?: URL,
  configFile?: string,
): Promise<GenerateConfig> {
  const configPath = configFile
    ? resolve(cwd, configFile)
    : resolve(join(cwd, "generate.config.ts"))
  const configName = configFile ?? "generate.config.ts"

  try {
    await access(configPath)
  } catch {
    throw new Error(
      `No ${configName} found in ${cwd}\n` +
        `Create one with:\n\n` +
        `  import { defineConfig } from "seedkit/generate"\n\n` +
        `  export default defineConfig({ collections: [...] })\n`,
    )
  }

  const alias: Record<string, string> = seedkitApiUrl
    ? { "seedkit/generate": fileURLToPath(seedkitApiUrl) }
    : {}
  const jiti = createJiti(import.meta.url, { alias })
  const mod = (await jiti.import(configPath)) as { default?: unknown }
  const result = GenerateConfigSchema.safeParse(mod.default)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")} — ${i.message}`)
      .join("\n")
    throw new Error(`Invalid generate.config.ts:\n${issues}`)
  }

  return result.data
}
