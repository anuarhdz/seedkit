import { loadConfig } from "../tools/generate/src/loader.js"
import { run } from "../tools/generate/src/run.js"

const args = process.argv.slice(3)
const dryRun = args.includes("--dry-run")
const skipExisting = args.includes("--skip-existing")
const seedkitApiUrl = new URL("./generate-api.js", import.meta.url)

async function main(): Promise<void> {
  const config = await loadConfig(process.cwd(), seedkitApiUrl)
  await run(config, { dryRun, skipExisting })
}

main().catch((err: unknown) => {
  console.error("\n❌", err instanceof Error ? err.message : err)
  process.exit(1)
})
