import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'unplugin-dts/vite'

export default defineConfig({
  plugins: [vue(), dts({ processor: 'vue', tsconfigPath: './tsconfig.json', include: ['src'], exclude: ['**/*.test.ts', '**/*.stories.ts', '**/examples/**'] })],
  build: {
    lib: {
      entry: { index: 'src/index.ts', 'docs-utils': 'src/docs/index.ts' },
      formats: ['es'],
      cssFileName: 'style',
    },
    rollupOptions: { external: ['vue', /^@eltonbautista\/tokens/] },
  },
})
