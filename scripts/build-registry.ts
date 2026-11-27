/**
 * Builds packages/mcp/src/registry.json from the library's own source:
 * component types (vue-component-meta), Cab<Name>.docs.md, example SFCs and the tokens JSON.
 *
 *   pnpm registry         write the file
 *   pnpm registry:check   exit 1 if the committed file is stale
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createChecker } from 'vue-component-meta'
import { parseDocsMd } from '../packages/vue/src/docs/parseDocsMd'
import type { ComponentEntry, PropEntry, Registry, TokenEntry } from '../packages/mcp/src/registry.types'

const stripUndefined = (t: string) => t.split(' | ').filter(p => p !== 'undefined').join(' | ')
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T

function sfcDescription(src: string, file: string): string {
  const m = /<script setup[^>]*>\s*\/\*\*([\s\S]*?)\*\//.exec(src)
  if (!m) throw new Error(`Missing component JSDoc at the top of <script setup> in ${file}`)
  return m[1]!.split('\n').map(l => l.replace(/^\s*\* ?/, '').trim()).filter(Boolean).join(' ')
}

function exampleDescription(src: string, file: string): string {
  const m = /^<!--\s*([\s\S]*?)\s*-->/.exec(src.trim())
  if (!m) throw new Error(`Example ${file} must start with an <!-- description --> comment`)
  return m[1]!
}

export function buildRegistry(root: string): Registry {
  const vueDir = join(root, 'packages/vue')
  const pkg = readJson<{ name: string; version: string }>(join(vueDir, 'package.json'))
  const tokensFile = join(root, 'packages/tokens/dist/tokens.json')
  if (!existsSync(tokensFile)) throw new Error('packages/tokens/dist/tokens.json is missing: run pnpm --filter @cabinet-ds/tokens build')
  const tokens = readJson<TokenEntry[]>(tokensFile)

  const checker = createChecker(join(vueDir, 'tsconfig.json'), { printer: { newLine: 1 } })
  const componentsDir = join(vueDir, 'src/components')
  const names = readdirSync(componentsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('Cab'))
    .map(d => d.name)
    .sort()

  const components: ComponentEntry[] = names.map(name => {
    const dir = join(componentsDir, name)
    const sfcPath = join(dir, `${name}.vue`)
    const docsFile = `${name}.docs.md`
    const docsPath = join(dir, docsFile)
    if (!existsSync(docsPath)) throw new Error(`Missing ${docsFile} for ${name} (every component needs one)`)
    const meta = checker.getComponentMeta(sfcPath)

    const props: PropEntry[] = meta.props
      .filter(p => !p.global)
      .map(p => ({
        name: p.name,
        type: stripUndefined(p.type),
        required: p.required,
        ...(p.default !== undefined ? { default: p.default } : {}),
        description: p.description,
      }))

    const exDir = join(dir, 'examples')
    const examples = readdirSync(exDir).filter(f => f.endsWith('.vue')).sort().map(f => {
      const code = readFileSync(join(exDir, f), 'utf8')
      return { name: f.replace(/\.vue$/, ''), description: exampleDescription(code, `${name}/examples/${f}`), code }
    })

    return {
      name,
      import: `import { ${name} } from '${pkg.name}'`,
      description: sfcDescription(readFileSync(sfcPath, 'utf8'), sfcPath),
      props,
      events: meta.events.map(e => ({ name: e.name, type: e.type, description: e.description })),
      slots: meta.slots.map(s => ({ name: s.name, type: s.type, description: s.description })),
      a11y: parseDocsMd(readFileSync(docsPath, 'utf8'), docsFile),
      examples,
    }
  })

  return { package: pkg.name, version: pkg.version, components, tokens }
}

export const registryPath = (root: string) => join(root, 'packages/mcp/src/registry.json')
export const serialize = (r: Registry) => JSON.stringify(r, null, 2) + '\n'

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const next = serialize(buildRegistry(root))
  const file = registryPath(root)
  if (process.argv.includes('--check')) {
    const current = existsSync(file) ? readFileSync(file, 'utf8') : ''
    if (current !== next) {
      console.error('registry.json is stale, run pnpm registry')
      process.exit(1)
    }
    console.log('registry.json is up to date')
  } else {
    writeFileSync(file, next)
    console.log(`wrote ${file}`)
  }
}
