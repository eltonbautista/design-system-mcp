import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CabCard from './CabCard.vue'
import md from './CabCard.docs.md?raw'
import Basic from './examples/Basic.vue'
import BasicSrc from './examples/Basic.vue?raw'
import Clickable from './examples/Clickable.vue'
import ClickableSrc from './examples/Clickable.vue?raw'
import { docsDescription } from '../../docs/parseDocsMd'
import { exampleStory } from '../../docs/stories'

const meta = {
  title: 'Components/CabCard',
  component: CabCard,
  parameters: { docs: { description: { component: docsDescription(md, 'CabCard.docs.md') } } },
  args: { title: 'Weekend game jam' },
} satisfies Meta<typeof CabCard>
export default meta
type Story = StoryObj<typeof meta>

export const BasicExample: Story = exampleStory('Basic', Basic, BasicSrc)
export const ClickableExample: Story = exampleStory('Whole-card link', Clickable, ClickableSrc)
