declare const __SEEDKIT_VERSION__: string

const COMMANDS = ["generate", "scrape", "transform"] as const
type Command = (typeof COMMANDS)[number]

function isCommand(c: string | undefined): c is Command {
  return COMMANDS.includes(c as Command)
}

const HELP: Record<Command, string> = {
  generate: `Usage: seedkit generate [options]

  Generates fake MDX files from a schema using Faker.
  Requires generate.config.ts in the current directory.

Options:
  --dry-run         Preview output paths without writing files
  --skip-existing   Skip files that already exist on disk
  --help, -h        Show this help message
`,
  scrape: `Usage: seedkit scrape [options]

  Scrapes web pages and converts them to MDX files.
  Requires scrape.config.ts in the current directory.

Options:
  --dry-run         Discover pages and preview output paths without fetching
  --skip-existing   Skip pages whose output file already exists
  --help, -h        Show this help message
`,
  transform: `Usage: seedkit transform [options]

  Batch-transforms existing MDX frontmatter/metadata fields.
  Requires transform.config.ts in the current directory.

Options:
  --dry-run         Preview changes without writing files
  --help, -h        Show this help message
`,
}

const cmd = process.argv[2]
const args = process.argv.slice(3)

if (cmd === "--version" || cmd === "-v") {
  console.log(__SEEDKIT_VERSION__)
  process.exit(0)
}

if (isCommand(cmd) && (args.includes("--help") || args.includes("-h"))) {
  console.log(HELP[cmd])
  process.exit(0)
}

if (!isCommand(cmd)) {
  if (cmd && cmd !== "--help" && cmd !== "-h") {
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
  --help, -h        Show this help message
  --dry-run         Preview changes without writing files
  --skip-existing   Skip files that already exist (generate, scrape)

Run \`seedkit <command> --help\` for command-specific options.
`)
  process.exit(0)
}

await import(new URL(`./${cmd}.js`, import.meta.url).href)
