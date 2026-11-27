import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { h } from 'vue'
import CabButton from './CabButton.vue'
import Basic from './examples/Basic.vue'
import Variants from './examples/Variants.vue'
import { expectNoA11yViolations } from '../../../test/axe'

const renderButton = async (props: Record<string, unknown> = {}) =>
  render(CabButton, { props, slots: { default: () => 'Save' } })

test('renders a native button with type=button by default', async () => {
  const screen = await renderButton()
  const btn = screen.getByRole('button', { name: 'Save' })
  await expect.element(btn).toHaveAttribute('type', 'button')
})

test('Enter and Space activate it and emit click', async () => {
  const screen = await renderButton()
  ;(screen.getByRole('button').element() as HTMLElement).focus()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard(' ')
  expect(screen.emitted('click')).toHaveLength(2)
})

test('loading sets aria-busy, ignores clicks, keeps focusability', async () => {
  const screen = await renderButton({ loading: true })
  const btn = screen.getByRole('button')
  await expect.element(btn).toHaveAttribute('aria-busy', 'true')
  await expect.element(btn).not.toHaveAttribute('disabled')
  await btn.click()
  expect(screen.emitted('click')).toBeUndefined()
  ;(btn.element() as HTMLElement).focus()
  expect(document.activeElement).toBe(btn.element())
})

test('disabled uses the native disabled attribute', async () => {
  const screen = await renderButton({ disabled: true })
  await expect.element(screen.getByRole('button')).toBeDisabled()
})

test('press moves by --cab-motion-distance-press only on :active', async () => {
  const screen = await renderButton()
  const el = screen.getByRole('button').element() as HTMLElement
  expect(getComputedStyle(el).transform).toBe('none')
  const rule = [...document.styleSheets].flatMap(s => [...s.cssRules])
    .find(r => r instanceof CSSStyleRule && /\.cab-button:active/.test(r.selectorText)) as CSSStyleRule | undefined
  expect(rule?.style.transform).toContain('var(--cab-motion-distance-press)')
})

test('examples have no axe violations', async () => {
  for (const Ex of [Basic, Variants]) {
    const screen = await render(h(Ex))
    await expectNoA11yViolations(screen.container)
  }
})
