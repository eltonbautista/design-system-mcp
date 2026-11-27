import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CabButton from './CabButton.vue'
import md from './CabButton.docs.md?raw'
import Basic from './examples/Basic.vue'
import BasicSrc from './examples/Basic.vue?raw'
import Variants from './examples/Variants.vue'
import VariantsSrc from './examples/Variants.vue?raw'
import { docsDescription } from '../../docs/parseDocsMd'

const meta = {
  title: 'Components/CabButton',
  component: CabButton,
  parameters: { docs: { description: { component: docsDescription(md, 'CabButton.docs.md') } } },
  args: { variant: 'primary', size: 'md' },
  render: args => ({ components: { CabButton }, setup: () => ({ args }), template: '<CabButton v-bind="args">Book a seat</CabButton>' }),
} satisfies Meta<typeof CabButton>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const BasicExample: Story = {
  name: 'Basic',
  render: () => ({ components: { Basic }, template: '<Basic />' }),
  parameters: { docs: { source: { code: BasicSrc, language: 'html' } } },
}
export const VariantsExample: Story = {
  name: 'Variants',
  render: () => ({ components: { Variants }, template: '<Variants />' }),
  parameters: { docs: { source: { code: VariantsSrc, language: 'html' } } },
}
