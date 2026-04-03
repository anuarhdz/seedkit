import { access } from "node:fs/promises"
import { join, resolve } from "node:path"
import { TransformConfigSchema } from "./schemas.js"
import type { TransformConfig } from "./types.js"

export async function loadConfig(cwd: string): Promise<TransformConfig> {
  const configPath = resolve(join(cwd, "transform.config.ts"))

  try {
    await access(configPath)
  } catch {
    throw new Error(
      `No transform.config.ts found in ${cwd}\n` +
        `Create one with:\n\n` +
        `  import { defineConfig } from "@mdx-tools/transform"\n\n` +
        `  export default defineConfig({ input: "./**/*.mdx", operations: [...] })\n`,
    )
  }

  const mod = (await import(configPath)) as { default?: unknown }
  const result = TransformConfigSchema.safeParse(mod.default)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")} — ${i.message}`)
      .join("\n")
    throw new Error(`Invalid transform.config.ts:\n${issues}`)
  }

  return result.data
}
