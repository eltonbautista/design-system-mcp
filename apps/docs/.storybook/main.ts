import type { StorybookConfig } from '@storybook/vue3-vite'
import { fileURLToPath } from 'node:url'

const vueSrc = fileURLToPath(new URL('../../../packages/vue/src/index.ts', import.meta.url))

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../../../packages/vue/src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/vue3-vite', options: { docgen: 'vue-component-meta' } },
  core: { disableTelemetry: true },
  viteFinal: async cfg => {
    cfg.resolve ??= {}
    const alias = [{ find: /^@cabinet-ds\/vue$/, replacement: vueSrc }]
    cfg.resolve.alias = Array.isArray(cfg.resolve.alias)
      ? [...alias, ...cfg.resolve.alias]
      : [...alias, ...Object.entries(cfg.resolve.alias ?? {}).map(([find, replacement]) => ({ find, replacement: replacement as string }))]
    return cfg
  },
}
export default config
