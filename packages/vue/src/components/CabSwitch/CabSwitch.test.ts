import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { h } from 'vue'
import CabSwitch from './CabSwitch.vue'
import Basic from './examples/Basic.vue'
import Settings from './examples/Settings.vue'
import { expectNoA11yViolations } from '../../../test/axe'

const base = { modelValue: false, label: 'Workshop reminders' }

test('has role switch named by its visible label', async () => {
  const screen = await render(CabSwitch, { props: base })
  await expect.element(screen.getByRole('switch', { name: 'Workshop reminders' })).toBeInTheDocument()
})

test('aria-checked reflects modelValue', async () => {
  const screen = await render(CabSwitch, { props: base })
  const sw = screen.getByRole('switch')
  await expect.element(sw).toHaveAttribute('aria-checked', 'false')
  await screen.rerender({ modelValue: true })
  await expect.element(sw).toHaveAttribute('aria-checked', 'true')
})

test('Space and Enter toggle', async () => {
  const screen = await render(CabSwitch, { props: base })
  ;(screen.getByRole('switch').element() as HTMLElement).focus()
  await userEvent.keyboard(' ')
  await userEvent.keyboard('{Enter}')
  expect(screen.emitted('update:modelValue')).toEqual([[true], [true]])
})

test('clicking the visible label toggles', async () => {
  const screen = await render(CabSwitch, { props: base })
  await screen.getByText('Workshop reminders').click()
  expect(screen.emitted('update:modelValue')).toEqual([[true]])
})

test('disabled prevents toggling', async () => {
  const screen = await render(CabSwitch, { props: { ...base, disabled: true } })
  await expect.element(screen.getByRole('switch')).toBeDisabled()
  await screen.getByText('Workshop reminders').click({ force: true })
  expect(screen.emitted('update:modelValue')).toBeUndefined()
})

test('examples have no axe violations', async () => {
  for (const Ex of [Basic, Settings]) {
    const screen = await render(h(Ex))
    await expectNoA11yViolations(screen.container)
  }
})
