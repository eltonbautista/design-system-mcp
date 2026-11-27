import { defineConfig, mergeConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  resolve: { alias: { '@cabinet-ds/vue': new URL('./src/index.ts', import.meta.url).pathname } },
  optimizeDeps: { include: ['axe-core', 'vue', 'vitest-browser-vue'] },
  test: {
    globals: true,
    setupFiles: ['test/setup.ts'],
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    browser: { enabled: true, provider: playwright(), headless: true, instances: [{ browser: 'chromium' }] },
  },
}))
