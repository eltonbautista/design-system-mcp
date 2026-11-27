import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { h } from 'vue'
import CabSelect from './CabSelect.vue'
import Basic from './examples/Basic.vue'
import WithError from './examples/WithError.vue'
import { expectNoA11yViolations } from '../../../test/axe'

const options = [
  { value: 'new', label: 'New to game design' },
  { value: 'hobby', label: 'Hobbyist' },
  { value: 'student', label: 'Student', disabled: true },
  { value: 'pro', label: 'Professional' },
]
const mount = (props: Record<string, unknown> = {}) =>
  render(CabSelect, { props: { modelValue: null, label: 'Experience', options, ...props } })
type Screen = Awaited<ReturnType<typeof mount>>
const combo = (s: Screen) => s.getByRole('combobox', { name: 'Experience' })
const focusCombo = (s: Screen) => (combo(s).element() as HTMLElement).focus()
const activeLabel = (s: Screen) => {
  const id = combo(s).element().getAttribute('aria-activedescendant')
  return id ? document.getElementById(id)?.textContent?.trim() : undefined
}
const expanded = (s: Screen) => combo(s).element().getAttribute('aria-expanded')

test('is a labelled combobox that shows the placeholder when empty', async () => {
  const s = await mount()
  await expect.element(combo(s)).toHaveTextContent('Select…')
  expect(expanded(s)).toBe('false')
})

for (const key of ['{ArrowDown}', '{ArrowUp}', '{Enter}', ' ', '{Alt>}{ArrowDown}{/Alt}']) {
  test(`${key} opens the listbox`, async () => {
    const s = await mount()
    focusCombo(s)
    await userEvent.keyboard(key)
    expect(expanded(s)).toBe('true')
    await expect.element(s.getByRole('listbox')).toBeVisible()
    expect(activeLabel(s)).toBe('New to game design')
  })
}

test('opening starts on the selected option', async () => {
  const s = await mount({ modelValue: 'pro' })
  focusCombo(s)
  await userEvent.keyboard('{ArrowDown}')
  expect(activeLabel(s)).toBe('Professional')
})

test('Up/Down move active option skipping disabled, without wrapping', async () => {
  const s = await mount()
  focusCombo(s)
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
  expect(activeLabel(s)).toBe('Professional')
  await userEvent.keyboard('{ArrowDown}')
  expect(activeLabel(s)).toBe('Professional')
  await userEvent.keyboard('{ArrowUp}')
  expect(activeLabel(s)).toBe('Hobbyist')
})

test('Home/End', async () => {
  const s = await mount()
  focusCombo(s)
  await userEvent.keyboard('{ArrowDown}{End}')
  expect(activeLabel(s)).toBe('Professional')
  await userEvent.keyboard('{Home}')
  expect(activeLabel(s)).toBe('New to game design')
})

test('Enter or Space selects and closes', async () => {
  const s = await mount()
  focusCombo(s)
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')
  expect(s.emitted('update:modelValue')).toEqual([['hobby']])
  expect(expanded(s)).toBe('false')
  await userEvent.keyboard('{ArrowDown}{End} ')
  expect(s.emitted('update:modelValue')?.at(-1)).toEqual(['pro'])
})

test('Escape closes without changing value', async () => {
  const s = await mount()
  focusCombo(s)
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Escape}')
  expect(expanded(s)).toBe('false')
  expect(s.emitted('update:modelValue')).toBeUndefined()
})

test('Tab selects active option and moves focus on', async () => {
  const s = await render({
    setup: () => () => [h(CabSelect, { modelValue: null, label: 'Experience', options }), h('button', 'Next')],
  })
  focusCombo(s as unknown as Screen)
  await userEvent.keyboard('{ArrowDown}{ArrowDown}{Tab}')
  expect(document.activeElement?.textContent).toBe('Next')
  expect(combo(s as unknown as Screen).element().getAttribute('aria-expanded')).toBe('false')
})

test('typing characters jumps to matching option (typeahead)', async () => {
  const s = await mount()
  focusCombo(s)
  await userEvent.keyboard('p')
  expect(expanded(s)).toBe('true')
  expect(activeLabel(s)).toBe('Professional')
  await userEvent.keyboard('{Escape}')
  await new Promise(r => setTimeout(r, 600))
  await userEvent.keyboard('ho')
  expect(activeLabel(s)).toBe('Hobbyist')
})

test('typeahead skips disabled options', async () => {
  const s = await mount()
  focusCombo(s)
  await userEvent.keyboard('s')
  expect(activeLabel(s)).not.toBe('Student')
})

test('clicking an option selects it and focus stays on the combobox', async () => {
  const s = await mount()
  await combo(s).click()
  expect(expanded(s)).toBe('true')
  await s.getByRole('option', { name: 'Professional' }).click()
  expect(s.emitted('update:modelValue')).toEqual([['pro']])
  expect(expanded(s)).toBe('false')
  expect(document.activeElement).toBe(combo(s).element())
})

test('clicking outside closes', async () => {
  const s = await render({ setup: () => () => [h('p', 'Outside'), h(CabSelect, { modelValue: null, label: 'Experience', options })] })
  await s.getByRole('combobox').click()
  await s.getByText('Outside').click()
  expect(s.getByRole('combobox').element().getAttribute('aria-expanded')).toBe('false')
})

test('options expose aria-selected and aria-disabled', async () => {
  const s = await mount({ modelValue: 'hobby' })
  focusCombo(s)
  await userEvent.keyboard('{ArrowDown}')
  await expect.element(s.getByRole('option', { name: 'Hobbyist' })).toHaveAttribute('aria-selected', 'true')
  await expect.element(s.getByRole('option', { name: 'Student' })).toHaveAttribute('aria-disabled', 'true')
})

test('error sets aria-invalid and is in aria-describedby', async () => {
  const s = await mount({ error: 'Pick the closest match.', hint: 'Helps us pair you up.' })
  await expect.element(combo(s)).toHaveAttribute('aria-invalid', 'true')
  const ids = combo(s).element().getAttribute('aria-describedby')!.split(' ')
  expect(document.getElementById(ids.at(-1)!)!.textContent).toContain('Pick the closest match.')
})

test('empty options / all disabled: shows placeholder, keys do not throw, loop or select', async () => {
  for (const props of [{ options: [] }, { options: options.map(o => ({ ...o, disabled: true })) }]) {
    const s = await mount(props)
    await expect.element(combo(s)).toHaveTextContent('Select…')
    focusCombo(s)
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{End}{Home}{Enter}{ArrowDown}x{Tab}')
    expect(s.emitted('update:modelValue')).toBeUndefined()
    expect(combo(s).element().getAttribute('aria-activedescendant')).toBeNull()
    await s.unmount()
  }
})

test('value not in options shows the placeholder and still lets you choose', async () => {
  const s = await mount({ modelValue: 'ghost' })
  await expect.element(combo(s)).toHaveTextContent('Select…')
  focusCombo(s)
  await userEvent.keyboard('{ArrowDown}')
  expect(activeLabel(s)).toBe('New to game design')
  await userEvent.keyboard('{Enter}')
  expect(s.emitted('update:modelValue')).toEqual([['new']])
})

test('two Selects have distinct ids', async () => {
  const s = await render({
    setup: () => () => [
      h(CabSelect, { modelValue: null, label: 'One', options }),
      h(CabSelect, { modelValue: null, label: 'Two', options }),
    ],
  })
  const [a, b] = s.getByRole('combobox').elements()
  expect(a!.getAttribute('aria-controls')).not.toBe(b!.getAttribute('aria-controls'))
  expect(a!.getAttribute('aria-labelledby')).not.toBe(b!.getAttribute('aria-labelledby'))
})

test('examples have no axe violations (closed and open)', async () => {
  for (const Ex of [Basic, WithError]) {
    const s = await render(h(Ex))
    await expectNoA11yViolations(s.container)
    ;(s.container.querySelector('[role=combobox]') as HTMLElement).focus()
    await userEvent.keyboard('{ArrowDown}')
    await Promise.all(document.getAnimations().map(a => a.finished)) // contrast is measured after the pop-in
    await expectNoA11yViolations(s.container)
    await s.unmount()
  }
})
