import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { defineComponent, h, ref } from 'vue'
import CabDialog from './CabDialog.vue'
import Basic from './examples/Basic.vue'
import Confirm from './examples/Confirm.vue'
import { expectNoA11yViolations } from '../../../test/axe'

/** A trigger button plus a dialog wired with v-model:open, like real usage. */
const Harness = defineComponent({
  props: { withTrigger: { type: Boolean, default: true } },
  setup(props) {
    const open = ref(false)
    const showTrigger = ref(props.withTrigger)
    return () => [
      showTrigger.value ? h('button', { id: 'trigger', onClick: () => { open.value = true } }, 'Open dialog') : null,
      h('button', { id: 'remove-trigger', onClick: () => { showTrigger.value = false } }, 'Remove trigger'),
      h(CabDialog, {
        open: open.value,
        'onUpdate:open': (v: boolean) => { open.value = v },
        title: 'Save your seat?',
        description: 'We will hold it for 24 hours.',
      }, {
        default: () => h('label', ['Name ', h('input', { id: 'name' })]),
        footer: () => h('button', { id: 'confirm' }, 'Confirm'),
      }),
    ]
  },
})
const openIt = async () => {
  const s = await render(Harness)
  await s.getByRole('button', { name: 'Open dialog' }).click()
  await expect.element(s.getByRole('dialog')).toBeVisible()
  return s
}
const active = () => document.activeElement as HTMLElement | null

test('opens as modal with role dialog and accessible name and description', async () => {
  const s = await openIt()
  const dialog = s.getByRole('dialog', { name: 'Save your seat?' })
  await expect.element(dialog).toHaveAccessibleDescription('We will hold it for 24 hours.')
  expect((dialog.element() as HTMLDialogElement).matches(':modal')).toBe(true)
})

test('focus moves inside on open, to the first focusable in the body', async () => {
  await openIt()
  await expect.poll(() => active()?.id).toBe('name')
})

test('Tab is trapped (cycles within dialog)', async () => {
  await openIt()
  await expect.poll(() => active()?.id).toBe('name')
  await userEvent.keyboard('{Tab}')
  expect(active()?.id).toBe('confirm')
  await userEvent.keyboard('{Tab}')
  expect(active()?.textContent).toContain('Close')
  await userEvent.keyboard('{Tab}')
  expect(active()?.id).toBe('name')
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
  expect(active()?.textContent).toContain('Close')
})

test('Escape emits update:open false and closes', async () => {
  const s = await openIt()
  await userEvent.keyboard('{Escape}')
  await expect.poll(() => (s.container.querySelector('dialog') as HTMLDialogElement).open).toBe(false)
})

test('close button closes', async () => {
  const s = await openIt()
  await s.getByRole('button', { name: 'Close' }).click()
  await expect.poll(() => (s.container.querySelector('dialog') as HTMLDialogElement).open).toBe(false)
})

test('focus returns to the trigger on close', async () => {
  await openIt()
  await userEvent.keyboard('{Escape}')
  await expect.poll(() => active()?.id).toBe('trigger')
})

test('does not throw when the trigger was removed before close', async () => {
  const errors: unknown[] = []
  const onErr = (e: ErrorEvent) => errors.push(e.error)
  window.addEventListener('error', onErr)
  const s = await openIt()
  // Remove the trigger while the dialog is open (simulated through the harness's own button, outside the modal).
  ;(s.container.querySelector('#remove-trigger') as HTMLButtonElement).click()
  await expect.poll(() => s.container.querySelector('#trigger')).toBeNull()
  await userEvent.keyboard('{Escape}')
  await expect.poll(() => (s.container.querySelector('dialog') as HTMLDialogElement).open).toBe(false)
  window.removeEventListener('error', onErr)
  expect(errors).toEqual([])
})

test('backdrop click closes; clicks inside do not', async () => {
  const s = await openIt()
  await s.getByText('Save your seat?').click()
  expect((s.container.querySelector('dialog') as HTMLDialogElement).open).toBe(true)
  await s.getByRole('dialog').click({ position: { x: 2, y: 2 } })
  await expect.poll(() => (s.container.querySelector('dialog') as HTMLDialogElement).open).toBe(false)
})

test('with nothing focusable in the body, focus goes to the close button', async () => {
  const s = await render(CabDialog, { props: { open: false, title: 'Heads up' }, slots: { default: () => 'Doors open at 9.' } })
  await s.rerender({ open: true })
  await expect.poll(() => active()?.textContent).toContain('Close')
})

test('examples have no axe violations when open', async () => {
  for (const Ex of [Basic, Confirm]) {
    const s = await render(h(Ex))
    ;(s.container.querySelector('button') as HTMLButtonElement).click()
    await expect.poll(() => (s.container.querySelector('dialog') as HTMLDialogElement).open).toBe(true)
    await Promise.all(document.getAnimations().map(a => a.finished))
    await expectNoA11yViolations(s.container)
    await s.unmount()
  }
})
