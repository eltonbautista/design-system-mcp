import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CabDialog from './CabDialog.vue'
import md from './CabDialog.docs.md?raw'
import Basic from './examples/Basic.vue'
import BasicSrc from './examples/Basic.vue?raw'
import Confirm from './examples/Confirm.vue'
import ConfirmSrc from './examples/Confirm.vue?raw'
import { docsDescription } from '../../docs/parseDocsMd'
import { exampleStory } from '../../docs/stories'

const meta = {
  title: 'Components/CabDialog',
  component: CabDialog,
  parameters: { docs: { description: { component: docsDescription(md, 'CabDialog.docs.md') } } },
  args: { open: false, title: 'Save your seat?' },
} satisfies Meta<typeof CabDialog>
export default meta
type Story = StoryObj<typeof meta>

export const BasicExample: Story = exampleStory('With a form', Basic, BasicSrc)
export const ConfirmExample: Story = exampleStory('Confirmation', Confirm, ConfirmSrc)
