/**
 * Scores a demo run directory against the Cabinet registry.
 *   tsx demo/score.ts demo/runs/with      → prints and writes demo/runs/with/score.json
 *
 * Static checks read src/**\/*.vue; runtime checks build the app and run axe on the built page.
 */
import { execSync, spawn } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Registry } from '../packages/mcp/src/registry.types'

export interface StaticScore {
  onlyLibraryComponents: boolean
  rawControls: number
  unknownComponents: string[]
  unknownProps: string[]
  hardcodedColors: number
  cabUsages: number
}
export interface Score extends StaticScore { buildOk: boolean; axeViolations: number | null; axeRules: string[] }

const PASSTHROUGH = new Set(['class', 'style', 'id', 'key', 'ref', 'role', 'title-attr'])
const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

function vueFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) return f === 'node_modules' ? [] : vueFiles(p)
    return p.endsWith('.vue') ? [p] : []
  })
}

const block = (src: string, tag: 'template' | 'style') =>
  [...src.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map(m => m[1]).join('\n')
  // template: the outermost <template> block is enough for these checks

/** Attribute names on a tag's opening text, normalised to prop names; null for non-prop attributes. */
function attrToProp(raw: string): { kind: 'prop' | 'event' | 'skip'; name: string } {
  if (raw.startsWith('#') || raw.startsWith('v-slot') || raw === 'v-if' || raw === 'v-else' || raw.startsWith('v-else-if') || raw.startsWith('v-for') || raw.startsWith('v-show')) return { kind: 'skip', name: raw }
  if (raw.startsWith('@') || raw.startsWith('v-on:')) return { kind: 'event', name: raw.replace(/^(@|v-on:)/, '').split('.')[0]! }
  if (raw === 'v-model') return { kind: 'prop', name: 'modelValue' }
  if (raw.startsWith('v-model:')) return { kind: 'prop', name: camel(raw.slice(8).split('.')[0]!) }
  const name = raw.replace(/^(:|v-bind:)/, '')
  if (PASSTHROUGH.has(name) || name.startsWith('aria-') || name.startsWith('data-') || name === 'v-bind') return { kind: 'skip', name }
  return { kind: 'prop', name: camel(name) }
}

export function staticScore(dir: string, registry: Registry): StaticScore {
  const byName = new Map(registry.components.map(c => [c.name, c]))
  let rawControls = 0, hardcodedColors = 0, cabUsages = 0
  const unknownComponents = new Set<string>(), unknownProps = new Set<string>()
  const colour = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g

  for (const file of vueFiles(join(dir, 'src'))) {
    const src = readFileSync(file, 'utf8')
    const template = block(src, 'template')
    rawControls += (template.match(/<(button|input|select|textarea|dialog)\b/g) ?? []).length
    hardcodedColors += (block(src, 'style').match(colour) ?? []).length
    for (const m of template.matchAll(/\bstyle="([^"]*)"/g)) hardcodedColors += (m[1]!.match(colour) ?? []).length

    for (const tag of template.matchAll(/<(Cab[A-Z]\w*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*\/?>/g)) {
      const name = tag[1]!
      cabUsages++
      const entry = byName.get(name)
      if (!entry) { unknownComponents.add(name); continue }
      const props = new Set(entry.props.map(p => p.name))
      const events = new Set(entry.events.map(e => e.name))
      for (const a of tag[2]!.matchAll(/\s+([^\s=>/]+)(?:="[^"]*")?/g)) {
        const { kind, name: n } = attrToProp(a[1]!)
        if (kind === 'prop' && !props.has(n)) unknownProps.add(`${name}.${n}`)
        if (kind === 'event' && !events.has(n) && !events.has(camel(n)) && n !== 'click') unknownProps.add(`${name}.@${n}`)
      }
    }
  }
  return {
    onlyLibraryComponents: rawControls === 0 && unknownComponents.size === 0,
    rawControls,
    unknownComponents: [...unknownComponents].sort(),
    unknownProps: [...unknownProps].sort(),
    hardcodedColors,
    cabUsages,
  }
}

async function runtimeScore(dir: string): Promise<Pick<Score, 'buildOk' | 'axeViolations' | 'axeRules'>> {
  try {
    execSync('npm run build', { cwd: dir, stdio: 'pipe' })
  } catch {
    return { buildOk: false, axeViolations: null, axeRules: [] }
  }
  const port = 4300 + Math.floor(Math.random() * 500)
  const preview = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: dir, stdio: 'ignore' })
  try {
    const { chromium } = await import('playwright')
    const axeSource = readFileSync(fileURLToPath(import.meta.resolve('axe-core/axe.min.js')), 'utf8')
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    for (let i = 0; i < 40; i++) {
      try { await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' }); break } catch { await new Promise(r => setTimeout(r, 250)) }
    }
    await page.screenshot({ path: join(dir, 'screenshot.png'), fullPage: true })
    await page.addScriptTag({ content: axeSource })
    const ids: string[] = await page.evaluate(async () =>
      // @ts-expect-error axe is injected above
      (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map((v: { id: string }) => v.id))
    await browser.close()
    return { buildOk: true, axeViolations: ids.length, axeRules: ids }
  } finally {
    preview.kill()
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = resolve(process.argv[2] ?? '')
  const registry = JSON.parse(readFileSync(new URL('../packages/mcp/src/registry.json', import.meta.url), 'utf8')) as Registry
  const score: Score = { ...staticScore(dir, registry), ...(await runtimeScore(dir)) }
  writeFileSync(join(dir, 'score.json'), JSON.stringify(score, null, 2) + '\n')
  console.log(JSON.stringify(score, null, 2))
}
