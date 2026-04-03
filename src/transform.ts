import { loadConfig } from "../tools/transform/src/loader.js"
import { run } from "../tools/transform/src/runner.js"

const args = process.argv.slice(3)
const dryRun = args.includes("--dry-run")
const configIndex = args.indexOf("--config")
const configFile = configIndex !== -1 ? args[configIndex + 1] : undefined
const seedkitApiUrl = new URL("./transform-api.js", import.meta.url)

async function main(): Promise<void> {
  const config = await loadConfig(process.cwd(), seedkitApiUrl, configFile)
  await run({ ...config, dryRun: dryRun || config.dryRun })
}

main().catch((err: unknown) => {
  console.error("\n❌", err instanceof Error ? err.message : err)
  process.exit(1)
})
