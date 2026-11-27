import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import PowerOn from './PowerOn.vue'

const meta = {
  title: 'Welcome',
  component: PowerOn,
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PowerOn>
export default meta

export const Cabinet: StoryObj<typeof meta> = {
  play: async ({ canvas }) => {
    // Content is visible by default and ends fully lit after the power-on.
    await expect(canvas.getByRole('heading', { level: 1, name: 'Cabinet' })).toBeVisible()
    await new Promise(r => setTimeout(r, 900))
    for (const b of canvas.getAllByRole('button')) {
      await expect(getComputedStyle(b).opacity).toBe('1')
      // GSAP must leave no inline filter behind (it would desaturate buttons and override the CSS hover glow).
      await expect(b.style.filter).toBe('')
    }
  },
}
