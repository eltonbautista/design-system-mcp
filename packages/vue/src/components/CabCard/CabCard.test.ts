import { render } from 'vitest-browser-vue'
import { h } from 'vue'
import CabCard from './CabCard.vue'
import Basic from './examples/Basic.vue'
import Clickable from './examples/Clickable.vue'
import { expectNoA11yViolations } from '../../../test/axe'

test('renders heading at the requested level', async () => {
  const s = await render(CabCard, { props: { title: 'Weekend workshop', headingLevel: 2 } })
  await expect.element(s.getByRole('heading', { level: 2, name: 'Weekend workshop' })).toBeInTheDocument()
})

test('defaults to an h3', async () => {
  const s = await render(CabCard, { props: { title: 'Weekend workshop' } })
  await expect.element(s.getByRole('heading', { level: 3 })).toBeInTheDocument()
})

test('article is labelled by its title', async () => {
  const s = await render(CabCard, { props: { title: 'Weekend workshop' } })
  await expect.element(s.getByRole('article', { name: 'Weekend workshop' })).toBeInTheDocument()
})

test('as="div" renders a plain container without a landmark name', async () => {
  const s = await render(CabCard, { props: { title: 'Weekend workshop', as: 'div' } })
  const root = s.container.firstElementChild!
  expect(root.tagName).toBe('DIV')
  expect(root.hasAttribute('aria-labelledby')).toBe(false)
})

test('has no interactive role and is not focusable', async () => {
  const s = await render(CabCard, { props: { title: 'Weekend workshop' }, slots: { default: () => 'Body' } })
  const root = s.container.firstElementChild as HTMLElement
  expect(root.tabIndex).toBe(-1)
  expect(root.getAttribute('role')).toBeNull()
})

test('renders media, body and footer slots in order', async () => {
  const s = await render(CabCard, {
    props: { title: 'T' },
    slots: { media: () => h('img', { alt: 'Game pieces', src: 'data:,' }), default: () => 'Body', footer: () => 'Foot' },
  })
  const text = s.container.textContent!
  expect(text.indexOf('Body')).toBeLessThan(text.indexOf('Foot'))
  expect(s.container.querySelector('.cab-card__media img')).not.toBeNull()
})

test('examples have no axe violations', async () => {
  for (const Ex of [Basic, Clickable]) {
    const s = await render(h(Ex))
    await expectNoA11yViolations(s.container)
    await s.unmount()
  }
})

test('href makes the title a link whose hit area covers the card', async () => {
  const s = await render(CabCard, { props: { title: 'Weekend workshop', href: '/workshops/weekend' } })
  const link = s.getByRole('link', { name: 'Weekend workshop' })
  await expect.element(link).toHaveAttribute('href', '/workshops/weekend')
  const after = getComputedStyle(link.element(), '::after')
  expect(after.position).toBe('absolute')
  expect(s.getByRole('heading').element().contains(link.element())).toBe(true)
})
