import { staticScore } from './score'
import registry from '../packages/mcp/src/registry.json'
import type { Registry } from '../packages/mcp/src/registry.types'

const fx = (n: string) => new URL(`./fixtures/${n}`, import.meta.url).pathname

test('clean fixture scores perfectly', () => {
  expect(staticScore(fx('clean'), registry as Registry)).toEqual({
    onlyLibraryComponents: true, rawControls: 0, unknownComponents: [], unknownProps: [], hardcodedColors: 0, cabUsages: 4,
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
  })
})
