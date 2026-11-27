import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { h } from 'vue'
import CabCheckbox from './CabCheckbox.vue'
import Basic from './examples/Basic.vue'
import WithHint from './examples/WithHint.vue'
import { expectNoA11yViolations } from '../../../test/axe'

const base = { modelValue: false, label: 'I agree to the code of conduct' }

test('role is checkbox with correct checked state', async () => {
  const screen = await render(CabCheckbox, { props: { ...base, modelValue: true } })
  await expect.element(screen.getByRole('checkbox', { name: base.label })).toBeChecked()
})

test('Space toggles and emits update:modelValue', async () => {
  const screen = await render(CabCheckbox, { props: base })
  ;(screen.getByRole('checkbox').element() as HTMLElement).focus()
  await userEvent.keyboard(' ')
  expect(screen.emitted('update:modelValue')).toEqual([[true]])
})

test('clicking the label toggles', async () => {
  const screen = await render(CabCheckbox, { props: base })
  await screen.getByText(base.label).click()
  expect(screen.emitted('update:modelValue')).toEqual([[true]])
})

test('stays in sync with modelValue (controlled)', async () => {
  const screen = await render(CabCheckbox, { props: base })
  await screen.getByText(base.label).click()
  expect(screen.emitted('update:modelValue')).toEqual([[true]])
  await expect.element(screen.getByRole('checkbox')).not.toBeChecked()
  await screen.rerender({ modelValue: true })
  await expect.element(screen.getByRole('checkbox')).toBeChecked()
})

test('disabled cannot be toggled', async () => {
  const screen = await render(CabCheckbox, { props: { ...base, disabled: true } })
  await expect.element(screen.getByRole('checkbox')).toBeDisabled()
})

test('hint is linked with aria-describedby', async () => {
  const screen = await render(CabCheckbox, { props: { ...base, hint: 'Short version: be kind.' } })
  const id = screen.getByRole('checkbox').element().getAttribute('aria-describedby')!
  expect(document.getElementById(id)!.textContent).toBe('Short version: be kind.')
})

test('focus ring is visible on keyboard focus', async () => {
  const screen = await render(CabCheckbox, { props: base })
  await userEvent.keyboard('{Tab}')
  const box = screen.container.querySelector('.cab-checkbox__box')!
  expect(getComputedStyle(box).outlineWidth).toBe('3px')
})

test('examples have no axe violations', async () => {
  for (const Ex of [Basic, WithHint]) {
    const screen = await render(h(Ex))
    await expectNoA11yViolations(screen.container)
  }
})
