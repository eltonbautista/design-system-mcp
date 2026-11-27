import { compareTokens, flattenDtcg } from './compare-figma-export'

const source = {
  palette: { $type: 'color', pink: { 600: { $value: '#D6146A' } }, white: { $value: '#FFFFFF' } },
  color: { $type: 'color', action: { primary: { bg: { $value: '{palette.pink.600}' } } }, text: { 'on-primary': { $value: '{palette.white}' } } },
  space: { $type: 'dimension', 4: { $value: '16px' } },
}

test('flattens DTCG to dotted paths with aliases resolved and colours lower-cased', () => {
  expect(flattenDtcg([source])).toEqual({
    'palette.pink.600': '#d6146a',
    'palette.white': '#ffffff',
    'color.action.primary.bg': '#d6146a',
    'color.text.on-primary': '#ffffff',
    'space.4': '16px',
  })
})

test('an identical export (aliases resolved by Figma) has 0 differences', () => {
  const figma = {
    color: { action: { primary: { bg: { $type: 'color', $value: '#d6146a' } } }, text: { 'on-primary': { $type: 'color', $value: '#ffffff' } } },
    space: { 4: { $type: 'dimension', $value: '16px' } },
  }
  expect(compareTokens(flattenDtcg([source]), flattenDtcg([figma]))).toEqual({ differences: [], missing: [] })
})

test('reports changed values and semantic tokens missing from the export', () => {
  const figma = { color: { action: { primary: { bg: { $type: 'color', $value: '#ff3d8b' } } } } }
  expect(compareTokens(flattenDtcg([source]), flattenDtcg([figma]))).toEqual({
    differences: [{ name: 'color.action.primary.bg', repo: '#d6146a', figma: '#ff3d8b' }],
    missing: ['color.text.on-primary', 'space.4'],
  })
})
