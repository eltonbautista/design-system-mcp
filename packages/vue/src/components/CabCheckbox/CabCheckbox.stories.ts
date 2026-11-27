import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import CabCheckbox from './CabCheckbox.vue'
import md from './CabCheckbox.docs.md?raw'
import Basic from './examples/Basic.vue'
import BasicSrc from './examples/Basic.vue?raw'
import WithHint from './examples/WithHint.vue'
import WithHintSrc from './examples/WithHint.vue?raw'
import { docsDescription } from '../../docs/parseDocsMd'
import { exampleStory } from '../../docs/stories'

const meta = {
  title: 'Components/CabCheckbox',
  component: CabCheckbox,
  parameters: { docs: { description: { component: docsDescription(md, 'CabCheckbox.docs.md') } } },
  args: { modelValue: false, label: 'I agree to the code of conduct' },
  render: args => ({
    components: { CabCheckbox },
    setup: () => { const v = ref(args.modelValue); return { args, v } },
    template: '<CabCheckbox v-bind="args" v-model="v" />',
  }),
} satisfies Meta<typeof CabCheckbox>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const BasicExample: Story = exampleStory('Basic', Basic, BasicSrc)
export const WithHintExample: Story = exampleStory('Group with hint', WithHint, WithHintSrc)
