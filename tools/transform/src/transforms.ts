import type { TransformOp } from "./types.js"

export function applyOperations(
  fields: Record<string, unknown>,
  ops: TransformOp[],
): Record<string, unknown> {
  const result = { ...fields }

  for (const op of ops) {
    switch (op.type) {
      case "rename-field": {
        if (op.from in result) {
          result[op.to] = result[op.from]
          delete result[op.from]
        }
        break
      }
      case "add-field": {
        if (op.overwrite || !(op.key in result)) {
          result[op.key] = op.value
        }
        break
      }
      case "remove-field": {
        delete result[op.key]
        break
      }
      case "transform-value": {
        if (op.key in result) {
          result[op.key] = op.fn(result[op.key])
        }
        break
      }
      case "set-field-if": {
        if (result[op.when.field] === op.when.equals) {
          result[op.key] = op.value
        }
        break
      }
    }
  }

  return result
}
