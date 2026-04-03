# Roadmap

## 1. ~~`npx seedkit` — CLI publicable~~ ✅

`npx seedkit generate|scrape|transform` funciona desde cualquier proyecto.
Config files importan `from "seedkit/generate"` etc. `@seedkit/core` permanece workspace-only y se bundlea con tsup.

## 2. Más field types en `generate`

Tipos de campo adicionales para cubrir casos de uso más ricos:

| type       | descripción                                                |
| ---------- | ---------------------------------------------------------- |
| `image`    | URL de placeholder (Picsum, Unsplash) con `width`/`height` |
| `richtext` | Markdown con formato real (headings, listas, bold)         |
| `number`   | Rango numérico con `min`/`max` y `precision`               |
| `boolean`  | Con `probability` configurable (ej. 0.3 = 30% true)        |

## 3. Watcher para `generate`

Flag `--watch` que observa cambios en `generate.config.ts` y regenera los archivos automáticamente. Útil para ajustar schemas en caliente durante el desarrollo.

```bash
npx seedkit generate --watch
```

## 4. Más operaciones en `transform`

Operaciones adicionales para casos más avanzados:

| operación         | descripción                                              |
| ----------------- | -------------------------------------------------------- |
| `transform-value` | Aplica una función al valor de un campo existente        |
| `set-field-if`    | `add-field` condicional basado en el valor de otro campo |

## 5. Scrape con autenticación

Soporte para scrapear sitios que requieren login — dashboards, docs privados, contenido tras paywall.

```ts
// scrape.config.ts
auth: {
  cookies: { session: "abc123" },
  headers: { Authorization: "Bearer token" },
}
```

## 6. Studio — UI visual local

Servidor local (`http://localhost:3456`) con interfaz web para gestionar el contenido sin tocar la terminal:

- **Generate**: lista colecciones, regenera por colección o archivo, preview MDX renderizado
- **Scrape**: preview de páginas descubiertas (dry-run visual), progress bar, log en tiempo real
- **Transform**: before/after por archivo antes de aplicar cambios

Reutiliza la lógica existente (`runner.ts`, schemas Zod) expuesta como API REST + WebSockets para live updates.
