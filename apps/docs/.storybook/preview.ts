import type { Preview } from '@storybook/vue3-vite'
import '@eltonbautista/tokens/tokens.css'
import '@eltonbautista/tokens/fonts.css'
import '../../../packages/vue/src/styles/focus.css'
import './preview.css'
import theme from './theme'

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
    docs: { theme },
    backgrounds: { disable: true },
    controls: { expanded: true },
  },
}
export default preview
