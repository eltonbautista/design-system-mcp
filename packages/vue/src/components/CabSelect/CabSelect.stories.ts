import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CabSelect from './CabSelect.vue'
import md from './CabSelect.docs.md?raw'
import Basic from './examples/Basic.vue'
import BasicSrc from './examples/Basic.vue?raw'
import WithError from './examples/WithError.vue'
import WithErrorSrc from './examples/WithError.vue?raw'
import { docsDescription } from '../../docs/parseDocsMd'
import { exampleStory } from '../../docs/stories'

const meta = {
  title: 'Components/CabSelect',
  component: CabSelect,
  parameters: { docs: { description: { component: docsDescription(md, 'CabSelect.docs.md') } } },
  args: { modelValue: null, label: 'Experience level', options: [] },
} satisfies Meta<typeof CabSelect>
export default meta
type Story = StoryObj<typeof meta>

export const BasicExample: Story = exampleStory('Basic', Basic, BasicSrc)
export const WithErrorExample: Story = exampleStory('With error', WithError, WithErrorSrc)
