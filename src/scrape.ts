import { loadConfig } from "../tools/scrape/src/loader.js"
import { run } from "../tools/scrape/src/runner.js"

const args = process.argv.slice(3)
const dryRun = args.includes("--dry-run")
const skipExisting = args.includes("--skip-existing")
const configIndex = args.indexOf("--config")
const configFile = configIndex !== -1 ? args[configIndex + 1] : undefined
const seedkitApiUrl = new URL("./scrape-api.js", import.meta.url)

async function main(): Promise<void> {
  const configs = await loadConfig(process.cwd(), seedkitApiUrl, configFile)
  const configArray = Array.isArray(configs) ? configs : [configs]
  for (const config of configArray) {
    await run(config, { dryRun, skipExisting })
  }
}

main().catch((err: unknown) => {
  console.error("\n❌", err instanceof Error ? err.message : err)
  process.exit(1)
})
