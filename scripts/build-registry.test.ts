import { mkdtempSync, cpSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildRegistry } from './build-registry'

const root = new URL('..', import.meta.url).pathname
const registry = buildRegistry(root)
const byName = (n: string) => registry.components.find(c => c.name === n)!

test('includes all 8 components sorted by name', () => {
  expect(registry.components.map(c => c.name)).toEqual([
    'CabButton', 'CabCard', 'CabCheckbox', 'CabDialog', 'CabSelect', 'CabSwitch', 'CabTabs', 'CabTextField',
  ])
})

test('records the package name and an import line', () => {
  expect(registry.package).toBe('@cabinet-ds/vue')
  expect(byName('CabButton').import).toBe("import { CabButton } from '@cabinet-ds/vue'")
})

test('CabButton.variant has its union type (no undefined) and default', () => {
  const variant = byName('CabButton').props.find(p => p.name === 'variant')!
  expect(variant.type).toBe('"primary" | "secondary" | "ghost"')
  expect(variant.default).toBe('"primary"')
  expect(variant.required).toBe(false)
  expect(variant.description).toMatch(/Visual weight/)
})

test('required props are marked required', () => {
  const label = byName('CabTextField').props.find(p => p.name === 'label')!
  expect(label.required).toBe(true)
})

test('global Vue props (key, ref, class) are excluded', () => {
  const names = byName('CabButton').props.map(p => p.name)
  expect(names).not.toContain('key')
  expect(names).not.toContain('ref')
})

test('CabTextField.events includes update:modelValue', () => {
  expect(byName('CabTextField').events.map(e => e.name)).toContain('update:modelValue')
})

test('CabTabs.slots includes panel', () => {
  expect(byName('CabTabs').slots.map(s => s.name)).toContain('panel')
})

test('component description comes from the SFC JSDoc', () => {
  expect(byName('CabSelect').description).toMatch(/select-only combobox/i)
})

test('a11y sections come from docs.md', () => {
  expect(byName('CabSelect').a11y.keyboard).toContain('| Escape (open) |')
})

test('every component has >=1 example whose code imports from @cabinet-ds/vue', () => {
  for (const c of registry.components) {
    expect(c.examples.length, c.name).toBeGreaterThan(0)
    for (const e of c.examples) {
      expect(e.code).toContain("from '@cabinet-ds/vue'")
      expect(e.description.length, `${c.name}/${e.name}`).toBeGreaterThan(0)
    }
  }
})

test('every token has a --cab- cssVar', () => {
  expect(registry.tokens.length).toBeGreaterThan(40)
  for (const t of registry.tokens) expect(t.cssVar.startsWith('--cab-')).toBe(true)
})

test('fails loudly when a component lacks docs.md', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'cab-reg-'))
  try {
    for (const p of ['packages/vue', 'packages/tokens/dist']) cpSync(join(root, p), join(tmp, p), { recursive: true, filter: s => !s.includes('node_modules') && !s.includes('/dist/') || s.includes('tokens/dist') })
    cpSync(join(root, 'tsconfig.base.json'), join(tmp, 'tsconfig.base.json'))
    rmSync(join(tmp, 'packages/vue/src/components/CabCard/CabCard.docs.md'))
    expect(() => buildRegistry(tmp)).toThrow(/CabCard\.docs\.md/)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

test('exported interfaces used by props are included verbatim', () => {
  expect(byName('CabSelect').types.join('\n')).toMatch(/export interface CabSelectOption \{[\s\S]*value: string[\s\S]*\}/)
  expect(byName('CabTabs').types.join('\n')).toContain('export interface CabTab {')
  expect(byName('CabButton').types).toEqual([])
})
