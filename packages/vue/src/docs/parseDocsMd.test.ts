import buttonMd from '../components/CabButton/CabButton.docs.md?raw'
import { parseDocsMd } from './parseDocsMd'

test('parses the fixed sections of a component docs file', () => {
  const d = parseDocsMd(buttonMd, 'CabButton.docs.md')
  expect(d.summary).toMatch(/arcade-style button/)
  expect(d.pattern).toContain('APG')
  expect(d.keyboard).toContain('| Enter |')
  expect(d.focus).toContain('focus-visible')
  expect(d.screenReader).toContain('aria-busy')
})

test('sections do not bleed into each other', () => {
  const d = parseDocsMd(buttonMd, 'CabButton.docs.md')
  expect(d.summary).not.toContain('## ')
  expect(d.keyboard).not.toContain('focus ring')
})

test('throws naming the missing section and file', () => {
  const md = buttonMd.replace('## Keyboard', '## Keys')
  expect(() => parseDocsMd(md, 'CabButton.docs.md')).toThrow('Missing section "Keyboard" in CabButton.docs.md')
})

test('docsDescription renders summary then an Accessibility section', async () => {
  const { docsDescription } = await import('./parseDocsMd')
  const md = docsDescription(buttonMd, 'CabButton.docs.md')
  expect(md.indexOf('arcade-style button')).toBeLessThan(md.indexOf('## Accessibility'))
  for (const h of ['### Pattern', '### Keyboard', '### Focus', '### Screen reader']) expect(md).toContain(h)
})
