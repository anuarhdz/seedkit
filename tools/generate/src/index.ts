#!/usr/bin/env node
import { faker } from "@faker-js/faker"
import { loadConfig } from "./loader.js"
import { run } from "./run.js"

const args = process.argv.slice(2)

function getFlag(name: string): string | null {
  const byEq = args.find((a) => a.startsWith(`--${name}=`))
  if (byEq) return byEq.split("=")[1] ?? null
  const idx = args.findIndex((a) => a === `--${name}`)
  if (idx !== -1) return args[idx + 1] ?? null
  return null
}

const seed = getFlag("seed")
if (seed !== null) faker.seed(Number(seed))

const dryRun = args.includes("--dry-run")
const skipExisting = args.includes("--skip-existing")

async function main(): Promise<void> {
  const config = await loadConfig(process.cwd())
  await run(config, { dryRun, skipExisting })
  console.log("\n✅ Done")
}

main().catch((err: unknown) => {
  console.error("\n❌", err instanceof Error ? err.message : err)
  process.exit(1)
})
