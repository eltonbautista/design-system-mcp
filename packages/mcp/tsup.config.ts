import { defineConfig } from 'tsup'
import { copyFileSync } from 'node:fs'

export default defineConfig({
  entry: { index: 'src/index.ts', stdio: 'src/stdio.ts' },
  format: ['esm'],
  target: 'node22',
  dts: { entry: { index: 'src/index.ts' } },
  clean: true,
  onSuccess: async () => { copyFileSync('src/registry.json', 'dist/registry.json') },
})
