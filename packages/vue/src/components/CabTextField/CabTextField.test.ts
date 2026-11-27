import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { h, ref } from 'vue'
import CabTextField from './CabTextField.vue'
import Basic from './examples/Basic.vue'
import WithHint from './examples/WithHint.vue'
import WithError from './examples/WithError.vue'
import { expectNoA11yViolations } from '../../../test/axe'

const base = { modelValue: '', label: 'Email' }

test('label is programmatically associated', async () => {
  const screen = await render(CabTextField, { props: base })
  await expect.element(screen.getByLabelText('Email')).toBeInTheDocument()
})

test('typing emits update:modelValue', async () => {
  const screen = await render(CabTextField, { props: base })
  await userEvent.type(screen.getByLabelText('Email'), 'a')
  expect(screen.emitted('update:modelValue')?.at(-1)).toEqual(['a'])
})

test('hint and error are both in aria-describedby, error last', async () => {
  const screen = await render(CabTextField, { props: { ...base, hint: 'We never share it.', error: 'Enter an email address.' } })
  const input = screen.getByLabelText('Email').element()
  const ids = input.getAttribute('aria-describedby')!.split(' ')
  expect(ids).toHaveLength(2)
  expect(document.getElementById(ids[0]!)!.textContent).toContain('We never share it.')
  expect(document.getElementById(ids[1]!)!.textContent).toContain('Enter an email address.')
})

test('error sets aria-invalid="true" and renders the text with color.danger.text', async () => {
  const screen = await render(CabTextField, { props: { ...base, error: 'Enter an email address.' } })
  await expect.element(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  const err = screen.getByText('Enter an email address.').element()
  expect(getComputedStyle(err).color).toBe('rgb(180, 0, 42)')
})

test('no error means no aria-invalid and no empty describedby', async () => {
  const screen = await render(CabTextField, { props: base })
  const input = screen.getByLabelText('Email')
  await expect.element(input).not.toHaveAttribute('aria-invalid')
  await expect.element(input).not.toHaveAttribute('aria-describedby')
})

test('required shows a visual marker that is aria-hidden and sets the required attribute', async () => {
  const screen = await render(CabTextField, { props: { ...base, required: true } })
  await expect.element(screen.getByRole('textbox', { name: 'Email', exact: true })).toBeRequired()
  const marker = screen.container.querySelector('.cab-field__required')!
  expect(marker.getAttribute('aria-hidden')).toBe('true')
})

test('two instances get distinct ids', async () => {
  const a = ref(''), b = ref('')
  const screen = await render({
    setup: () => () => [
      h(CabTextField, { label: 'First', modelValue: a.value, hint: 'h1' }),
      h(CabTextField, { label: 'Second', modelValue: b.value, hint: 'h2' }),
    ],
  })
  const one = screen.getByLabelText('First').element(), two = screen.getByLabelText('Second').element()
  expect(one.id).not.toBe(two.id)
  expect(one.getAttribute('aria-describedby')).not.toBe(two.getAttribute('aria-describedby'))
})

test('examples have no axe violations', async () => {
  for (const Ex of [Basic, WithHint, WithError]) {
    const screen = await render(h(Ex))
    await expectNoA11yViolations(screen.container)
  }
})
