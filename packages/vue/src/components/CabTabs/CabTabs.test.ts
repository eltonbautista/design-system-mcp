import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { h } from 'vue'
import CabTabs from './CabTabs.vue'
import Basic from './examples/Basic.vue'
import Manual from './examples/Manual.vue'
import { expectNoA11yViolations } from '../../../test/axe'

const tabs = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'venue', label: 'Venue' },
  { id: 'faq', label: 'FAQ' },
]
const slots = { panel: ({ tab }: { tab: { label: string } }) => h('p', `${tab.label} panel`) }
const mount = (props: Record<string, unknown> = {}) =>
  render(CabTabs, { props: { tabs, label: 'Workshop details', modelValue: 'schedule', ...props }, slots })
const focused = () => document.activeElement?.textContent?.trim()
const focusTab = (screen: Awaited<ReturnType<typeof mount>>, name: string) =>
  (screen.getByRole('tab', { name }).element() as HTMLElement).focus()

test('renders a named tablist with one selected tab and its panel', async () => {
  const screen = await mount()
  await expect.element(screen.getByRole('tablist', { name: 'Workshop details' })).toBeInTheDocument()
  await expect.element(screen.getByRole('tab', { name: 'Schedule' })).toHaveAttribute('aria-selected', 'true')
  await expect.element(screen.getByRole('tabpanel', { name: 'Schedule' })).toHaveTextContent('Schedule panel')
})

test('only the active tab is in the tab order', async () => {
  const screen = await mount()
  const idx = screen.getByRole('tab').elements().map(e => e.getAttribute('tabindex'))
  expect(idx).toEqual(['0', '-1', '-1'])
})

test('ArrowRight/ArrowLeft move focus and wrap', async () => {
  const screen = await mount()
  focusTab(screen, 'Schedule')
  await userEvent.keyboard('{ArrowLeft}')
  expect(focused()).toBe('FAQ')
  await userEvent.keyboard('{ArrowRight}')
  expect(focused()).toBe('Schedule')
  await userEvent.keyboard('{ArrowRight}')
  expect(focused()).toBe('Venue')
})

test('Home/End jump', async () => {
  const screen = await mount()
  focusTab(screen, 'Schedule')
  await userEvent.keyboard('{End}')
  expect(focused()).toBe('FAQ')
  await userEvent.keyboard('{Home}')
  expect(focused()).toBe('Schedule')
})

test('automatic activation selects on focus', async () => {
  const screen = await mount()
  focusTab(screen, 'Schedule')
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.emitted('update:modelValue')).toEqual([['venue']])
})

test('manual activation requires Enter or Space', async () => {
  const screen = await mount({ activation: 'manual' })
  focusTab(screen, 'Schedule')
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.emitted('update:modelValue')).toBeUndefined()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard('{ArrowRight}')
  await userEvent.keyboard(' ')
  expect(screen.emitted('update:modelValue')).toEqual([['venue'], ['faq']])
})

test('arrow keys skip disabled tabs', async () => {
  const screen = await mount({ tabs: [tabs[0], { ...tabs[1], disabled: true }, tabs[2]] })
  focusTab(screen, 'Schedule')
  await userEvent.keyboard('{ArrowRight}')
  expect(focused()).toBe('FAQ')
})

test('unknown or disabled modelValue falls back to first enabled tab', async () => {
  const unknown = await mount({ modelValue: 'nope' })
  await expect.element(unknown.getByRole('tab', { name: 'Schedule' })).toHaveAttribute('aria-selected', 'true')
  await unknown.unmount()
  const disabled = await mount({ modelValue: 'schedule', tabs: [{ ...tabs[0], disabled: true }, tabs[1], tabs[2]] })
  await expect.element(disabled.getByRole('tab', { name: 'Venue' })).toHaveAttribute('aria-selected', 'true')
  await expect.element(disabled.getByRole('tab', { name: 'Venue' })).toHaveAttribute('tabindex', '0')
})

test('tab aria-controls matches panel id and panel aria-labelledby matches tab id', async () => {
  const screen = await mount()
  const tab = screen.getByRole('tab', { name: 'Schedule' }).element()
  const panel = screen.getByRole('tabpanel').element()
  expect(tab.getAttribute('aria-controls')).toBe(panel.id)
  expect(panel.getAttribute('aria-labelledby')).toBe(tab.id)
  expect(panel.getAttribute('tabindex')).toBe('0')
})

test('two Tabs on one page have distinct ids', async () => {
  const screen = await render({
    setup: () => () => [
      h(CabTabs, { tabs, label: 'One', modelValue: 'schedule' }, slots),
      h(CabTabs, { tabs, label: 'Two', modelValue: 'schedule' }, slots),
    ],
  })
  const ids = screen.getByRole('tab').elements().map(e => e.id)
  expect(new Set(ids).size).toBe(6)
})

test('examples have no axe violations', async () => {
  for (const Ex of [Basic, Manual]) {
    const screen = await render(h(Ex))
    await expectNoA11yViolations(screen.container)
  }
})
