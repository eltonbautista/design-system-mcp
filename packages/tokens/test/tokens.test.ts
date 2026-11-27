import { readFileSync, existsSync } from 'node:fs'
import { contrastRatio } from './contrast'

const dist = (f: string) => new URL(`../dist/${f}`, import.meta.url)
const read = (f: string) => readFileSync(dist(f), 'utf8')
type Tok = { name: string; cssVar: string; value: string; type: string }
const tokens: Tok[] = existsSync(dist('tokens.json')) ? JSON.parse(read('tokens.json')) : []
const pairs: [string, string, number][] = JSON.parse(readFileSync(new URL('../contrast-pairs.json', import.meta.url), 'utf8'))
const css = existsSync(dist('tokens.css')) ? read('tokens.css') : ''
const byName = new Map(tokens.map(t => [t.name, t.value]))

test('contrastRatio matches known WCAG values', () => {
  expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
  expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
})

test('emits prefixed custom properties', () => {
  expect(css).toContain('--cab-color-action-primary-bg: #d6146a')
  expect(css).toContain('--cab-motion-easing-standard: cubic-bezier(0.16, 1, 0.3, 1)')
})

test('reduced motion zeroes movement only', () => {
  expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*{\s*:root\s*{[^}]*--cab-motion-distance-press: 0px/)
  expect(css.match(/prefers-reduced-motion[\s\S]*$/)![0]).not.toContain('duration')
})

test('every token has a --cab- cssVar and a dotted name', () => {
  expect(tokens.length).toBeGreaterThan(40)
  for (const t of tokens) {
    expect(t.cssVar).toBe(`--cab-${t.name.replaceAll('.', '-')}`)
  }
})

test('JS module exports values keyed by var name', async () => {
  const mod = await import(dist('tokens.js').href)
  expect(mod.tokens['cab-color-bg-canvas']).toBe('#fff6ec')
})

test.each(pairs)('%s on %s meets %d:1', (fg, bg, min) => {
  const f = byName.get(fg), b = byName.get(bg)
  expect(f, `missing token ${fg}`).toBeDefined()
  expect(b, `missing token ${bg}`).toBeDefined()
  expect(contrastRatio(f!, b!)).toBeGreaterThanOrEqual(min)
})

test('no SDS naming leaks into output', () => {
  expect(css).not.toMatch(/--sds-/)
})
