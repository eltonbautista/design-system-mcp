import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import CabTextField from './CabTextField.vue'
import md from './CabTextField.docs.md?raw'
import Basic from './examples/Basic.vue'
import BasicSrc from './examples/Basic.vue?raw'
import WithHint from './examples/WithHint.vue'
import WithHintSrc from './examples/WithHint.vue?raw'
import WithError from './examples/WithError.vue'
import WithErrorSrc from './examples/WithError.vue?raw'
import { docsDescription } from '../../docs/parseDocsMd'
import { exampleStory } from '../../docs/stories'

const meta = {
  title: 'Components/CabTextField',
  component: CabTextField,
  parameters: { docs: { description: { component: docsDescription(md, 'CabTextField.docs.md') } } },
  args: { modelValue: '', label: 'Email', type: 'email', hint: 'We only use it to send your ticket.' },
  render: args => ({
    components: { CabTextField },
    setup: () => { const v = ref(args.modelValue); return { args, v } },
    template: '<CabTextField v-bind="args" v-model="v" />',
  }),
} satisfies Meta<typeof CabTextField>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const BasicExample: Story = exampleStory('Basic', Basic, BasicSrc)
export const WithHintExample: Story = exampleStory('With hint', WithHint, WithHintSrc)
export const WithErrorExample: Story = exampleStory('With error', WithError, WithErrorSrc)
