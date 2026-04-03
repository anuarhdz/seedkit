#!/usr/bin/env node
import { loadConfig } from "./loader.js"
import { run } from "./runner.js"

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const skipExisting = args.includes("--skip-existing")

async function main(): Promise<void> {
  const config = await loadConfig(process.cwd())
  await run(config, { dryRun, skipExisting })
}

main().catch((err: unknown) => {
  console.error("\n❌", err instanceof Error ? err.message : err)
  process.exit(1)
})
