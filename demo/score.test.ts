import { staticScore } from './score'
import registry from '../packages/mcp/src/registry.json'
import type { Registry } from '../packages/mcp/src/registry.types'

const fx = (n: string) => new URL(`./fixtures/${n}`, import.meta.url).pathname

test('clean fixture scores perfectly', () => {
  expect(staticScore(fx('clean'), registry as Registry)).toEqual({
    onlyLibraryComponents: true, rawControls: 0, unknownComponents: [], unknownProps: [], hardcodedColors: 0, cabUsages: 4, unknownTokens: [],
  })
})

test('dirty fixture flags raw controls, unknown props/components and colours', () => {
  expect(staticScore(fx('dirty'), registry as Registry)).toEqual({
    onlyLibraryComponents: false,
    rawControls: 1,
    unknownComponents: ['CabMegaHero'],
    unknownProps: ['CabButton.tone'],
    hardcodedColors: 2,
    cabUsages: 2,
    unknownTokens: ['--cab-color-danger'],
  })
})

test('components after a nested <template #slot> are still checked', () => {
  const s = staticScore(fx('nested'), registry as Registry)
  expect(s.cabUsages).toBe(3)
  expect(s.unknownProps).toEqual(['CabTextField.colour'])
  expect(s.rawControls).toBe(1)
})

test('gotoWhenReady throws when the preview server never comes up (no silent about:blank pass)', async () => {
  const { gotoWhenReady } = await import('./score')
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await expect(gotoWhenReady(page, 'http://localhost:1/', 3, 10)).rejects.toThrow(/never became reachable/)
  await browser.close()
}, 30_000)
