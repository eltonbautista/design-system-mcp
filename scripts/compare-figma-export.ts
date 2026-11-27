/**
 * Checks the Figma variables round trip: the repo's token JSON vs a DTCG export from Figma.
 *   pnpm figma:compare [path/to/export.tokens.json ...]   (default: packages/tokens/figma/*.json)
 * Compares resolved values of the semantic tokens (palette primitives are compared only if exported).
 * Exits 1 with a list when anything differs.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Node = { [key: string]: unknown }

const isToken = (n: unknown): n is { $value: unknown } => typeof n === 'object' && n !== null && '$value' in n

function normalise(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  const s = String(value).trim()
  return /^#[0-9a-f]{3,8}$/i.test(s) ? s.toLowerCase() : s
}

/** Flattens one or more DTCG documents into `path → resolved value`. Aliases like `{palette.pink.600}` are followed. */
export function flattenDtcg(docs: Node[]): Record<string, string> {
  const raw: Record<string, unknown> = {}
  const walk = (node: Node, path: string[]) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue
      if (isToken(v)) raw[[...path, k].join('.')] = v.$value
      else if (typeof v === 'object' && v !== null) walk(v as Node, [...path, k])
    }
  }
  for (const d of docs) walk(d, [])
  const resolve = (v: unknown, seen: Set<string>): unknown => {
    if (typeof v !== 'string') return v
    const m = /^\{([^}]+)\}$/.exec(v.trim())
    if (!m) return v
    const ref = m[1]!
    if (seen.has(ref) || !(ref in raw)) throw new Error(`Unresolvable alias {${ref}}`)
    return resolve(raw[ref], new Set([...seen, ref]))
  }
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, normalise(resolve(v, new Set([k])))]))
}

export function compareTokens(repo: Record<string, string>, figma: Record<string, string>) {
  const semantic = Object.keys(repo).filter(k => !k.startsWith('palette.') || k in figma).sort()
  return {
    differences: semantic.filter(k => k in figma && figma[k] !== repo[k]).map(k => ({ name: k, repo: repo[k]!, figma: figma[k]! })),
    missing: semantic.filter(k => !(k in figma)),
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const read = (p: string) => JSON.parse(readFileSync(p, 'utf8')) as Node
  const srcDir = join(root, 'packages/tokens/src')
  const repo = flattenDtcg(readdirSync(srcDir).filter(f => f.endsWith('.tokens.json')).map(f => read(join(srcDir, f))))
  const figmaDir = join(root, 'packages/tokens/figma')
  const exports = process.argv.slice(2).length
    ? process.argv.slice(2)
    : existsSync(figmaDir) ? readdirSync(figmaDir).filter(f => f.endsWith('.json')).map(f => join(figmaDir, f)) : []
  if (!exports.length) throw new Error('No Figma export found: pass a path or put it in packages/tokens/figma/')
  const { differences, missing } = compareTokens(repo, flattenDtcg(exports.map(read)))
  for (const d of differences) console.log(`≠ ${d.name}: repo ${d.repo}, figma ${d.figma}`)
  for (const m of missing) console.log(`missing in Figma export: ${m}`)
  console.log(`${differences.length} differences, ${missing.length} missing`)
  process.exit(differences.length || missing.length ? 1 : 0)
}
