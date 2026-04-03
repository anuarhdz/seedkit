#!/usr/bin/env node
import { loadConfig } from "./loader.js"
import { run } from "./runner.js"

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")

async function main(): Promise<void> {
  const config = await loadConfig(process.cwd())
  // CLI --dry-run overrides config
  await run({ ...config, dryRun: dryRun || config.dryRun })
  console.log("\n✅ Done")
}

main().catch((err: unknown) => {
  console.error("\n❌", err instanceof Error ? err.message : err)
  process.exit(1)
})
