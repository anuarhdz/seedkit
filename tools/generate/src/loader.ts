import { access } from "node:fs/promises"
import { join, resolve } from "node:path"
import { GenerateConfigSchema } from "@mdx-tools/core"
import type { GenerateConfig } from "@mdx-tools/core"

export async function loadConfig(cwd: string): Promise<GenerateConfig> {
  const configPath = resolve(join(cwd, "generate.config.ts"))

  try {
    await access(configPath)
  } catch {
    throw new Error(
      `No generate.config.ts found in ${cwd}\n` +
        `Create one with:\n\n` +
        `  import { defineConfig } from "@mdx-tools/core"\n\n` +
        `  export default defineConfig({ collections: [...] })\n`,
    )
  }

  const mod = (await import(configPath)) as { default?: unknown }
  const result = GenerateConfigSchema.safeParse(mod.default)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")} — ${i.message}`)
      .join("\n")
    throw new Error(`Invalid generate.config.ts:\n${issues}`)
  }

  return result.data
}
