import type { StorybookConfig } from '@storybook/vue3-vite'
import { fileURLToPath } from 'node:url'

const vueSrc = fileURLToPath(new URL('../../../packages/vue/src/index.ts', import.meta.url))

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../../../packages/vue/src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/vue3-vite', options: { docgen: 'vue-component-meta' } },
  core: { disableTelemetry: true },
  viteFinal: async cfg => {
    // Examples import from '@eltonbautista/vue'; point that at the source so docs never show a stale build.
    const { mergeConfig } = await import('vite')
    return mergeConfig(cfg, { resolve: { alias: [{ find: /^@eltonbautista\/vue$/, replacement: vueSrc }] } })
  },
}
export default config
