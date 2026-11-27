import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CabTabs from './CabTabs.vue'
import md from './CabTabs.docs.md?raw'
import Basic from './examples/Basic.vue'
import BasicSrc from './examples/Basic.vue?raw'
import Manual from './examples/Manual.vue'
import ManualSrc from './examples/Manual.vue?raw'
import { docsDescription } from '../../docs/parseDocsMd'
import { exampleStory } from '../../docs/stories'

const meta = {
  title: 'Components/CabTabs',
  component: CabTabs,
  parameters: { docs: { description: { component: docsDescription(md, 'CabTabs.docs.md') } } },
  args: { tabs: [], label: 'Workshop details' },
} satisfies Meta<typeof CabTabs>
export default meta
type Story = StoryObj<typeof meta>

export const BasicExample: Story = exampleStory('Automatic activation', Basic, BasicSrc)
export const ManualExample: Story = exampleStory('Manual activation', Manual, ManualSrc)
