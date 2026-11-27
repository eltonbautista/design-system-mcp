import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import CabSwitch from './CabSwitch.vue'
import md from './CabSwitch.docs.md?raw'
import Basic from './examples/Basic.vue'
import BasicSrc from './examples/Basic.vue?raw'
import Settings from './examples/Settings.vue'
import SettingsSrc from './examples/Settings.vue?raw'
import { docsDescription } from '../../docs/parseDocsMd'
import { exampleStory } from '../../docs/stories'

const meta = {
  title: 'Components/CabSwitch',
  component: CabSwitch,
  parameters: { docs: { description: { component: docsDescription(md, 'CabSwitch.docs.md') } } },
  args: { modelValue: true, label: 'Workshop reminders' },
  render: args => ({
    components: { CabSwitch },
    setup: () => { const v = ref(args.modelValue); return { args, v } },
    template: '<CabSwitch v-bind="args" v-model="v" />',
  }),
} satisfies Meta<typeof CabSwitch>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const BasicExample: Story = exampleStory('Basic', Basic, BasicSrc)
export const SettingsExample: Story = exampleStory('Settings list', Settings, SettingsSrc)
