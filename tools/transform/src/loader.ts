import { access } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { join, resolve } from "node:path"
import { createJiti } from "jiti"
import { TransformConfigSchema } from "./schemas.js"
import type { TransformConfig } from "./types.js"

export async function loadConfig(
  cwd: string,
  seedkitApiUrl?: URL,
  configFile?: string,
): Promise<TransformConfig> {
  const configPath = configFile
    ? resolve(cwd, configFile)
    : resolve(join(cwd, "transform.config.ts"))
  const configName = configFile ?? "transform.config.ts"

  try {
    await access(configPath)
  } catch {
    throw new Error(
      `No ${configName} found in ${cwd}\n` +
        `Create one with:\n\n` +
        `  import { defineConfig } from "seedkit/transform"\n\n` +
        `  export default defineConfig({ input: "./**/*.mdx", operations: [...] })\n`,
    )
  }

  const alias: Record<string, string> = seedkitApiUrl
    ? { "seedkit/transform": fileURLToPath(seedkitApiUrl) }
    : {}
  const jiti = createJiti(import.meta.url, { alias })
  const mod = (await jiti.import(configPath)) as { default?: unknown }
  const result = TransformConfigSchema.safeParse(mod.default)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")} — ${i.message}`)
      .join("\n")
    throw new Error(`Invalid transform.config.ts:\n${issues}`)
  }

  return result.data
}
