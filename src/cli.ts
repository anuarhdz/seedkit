declare const __SEEDKIT_VERSION__: string

const COMMANDS = ["generate", "scrape", "transform"] as const
type Command = (typeof COMMANDS)[number]

function isCommand(c: string | undefined): c is Command {
  return COMMANDS.includes(c as Command)
}

const cmd = process.argv[2]

if (cmd === "--version" || cmd === "-v") {
  console.log(__SEEDKIT_VERSION__)
  process.exit(0)
}

if (!isCommand(cmd)) {
  if (cmd) {
    console.error(`Unknown command: ${cmd}\n`)
    process.exit(1)
  }
  console.log(`Usage: seedkit <command> [options]

Commands:
  generate    Generate fake MDX files from a schema  (requires generate.config.ts)
  scrape      Scrape web pages and convert to MDX     (requires scrape.config.ts)
  transform   Batch-transform existing MDX files      (requires transform.config.ts)

Options:
  --version, -v     Print the version number
  --dry-run         Preview changes without writing files
  --skip-existing   Skip files that already exist (generate, scrape)
`)
  process.exit(0)
}

await import(new URL(`./${cmd}.js`, import.meta.url).href)
