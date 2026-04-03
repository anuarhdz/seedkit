import type { FieldEntry, SerializableRecord, SerializableValue } from "./types.js"

// --- YAML frontmatter serializer ---

function yamlValue(value: SerializableValue, indent = 0): string {
  const pad = " ".repeat(indent)

  if (typeof value === "boolean") return String(value)
  if (typeof value === "number") return String(value)

  if (typeof value === "string") {
    const sanitized = value.replace(/\r/g, "").replace(/\n/g, " ")
    // Quote strings that could be misinterpreted as YAML
    const needsQuotes = /[:#{}[\],&*?|<>=!%@`]/.test(sanitized) || /^\s|\s$/.test(sanitized)
    if (needsQuotes) return `"${sanitized.replace(/"/g, '\\"')}"`
    return sanitized
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    return value
      .map((item) => `\n${pad}  - ${yamlValue(item as SerializableValue, indent + 2)}`)
      .join("")
  }

  // object
  const entries = Object.entries(value as Record<string, SerializableValue>)
  if (entries.length === 0) return "{}"
  return entries.map(([k, v]) => `\n${pad}  ${k}: ${yamlValue(v, indent + 2)}`).join("")
}

export function serializeToFrontmatter(record: SerializableRecord): string {
  const lines: string[] = ["---"]

  for (const [key, entry] of Object.entries(record)) {
    const raw = entry.value

    if (Array.isArray(raw)) {
      lines.push(`${key}:`)
      for (const item of raw) {
        lines.push(`  - ${yamlValue(item as SerializableValue)}`)
      }
    } else if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
      lines.push(`${key}:`)
      for (const [k, v] of Object.entries(raw as Record<string, SerializableValue>)) {
        lines.push(`  ${k}: ${yamlValue(v, 2)}`)
      }
    } else {
      lines.push(`${key}: ${yamlValue(raw as SerializableValue)}`)
    }
  }

  lines.push("---")
  return lines.join("\n") + "\n"
}

// --- metadata-export serializer ---

function jsValue(entry: FieldEntry): string {
  const { value, isDate } = entry

  if (isDate && typeof value === "string") {
    return `new Date( '${value}' )`
  }

  if (typeof value === "boolean") return String(value)
  if (typeof value === "number") return String(value)

  if (typeof value === "string") {
    const sanitized = value.replace(/\r/g, "").replace(/\n/g, " ")
    return `'${sanitized.replaceAll("'", "\\'")}'`
  }

  if (Array.isArray(value)) {
    const items = value.map((v) => jsValue({ value: v as SerializableValue })).join(", ")
    return `[ ${items} ]`
  }

  // object
  const entries = Object.entries(value as Record<string, SerializableValue>)
    .map(([k, v]) => `${k}: ${jsValue({ value: v })}`)
    .join(", ")
  return `{ ${entries} }`
}

export function serializeToMetadataExport(record: SerializableRecord): string {
  const lines = ["export const metadata = {"]

  for (const [key, entry] of Object.entries(record)) {
    lines.push(`  ${key}: ${jsValue(entry)},`)
  }

  lines.push("}")
  return lines.join("\n") + "\n"
}
