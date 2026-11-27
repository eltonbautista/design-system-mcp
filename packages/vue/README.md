# @eltonbautista/vue

Cabinet is a small, playful Vue 3 component library with an arcade-cabinet feel and a tested accessibility contract on every component.

**Components:** `CabButton`, `CabTextField`, `CabCheckbox`, `CabSwitch`, `CabSelect`, `CabTabs`, `CabDialog`, `CabCard`.

## Install

```sh
npm i @eltonbautista/vue @eltonbautista/tokens
```

```ts
// main.ts
import '@eltonbautista/tokens/tokens.css'   // design tokens (CSS custom properties)
import '@eltonbautista/tokens/fonts.css'    // Sora + Outfit (optional)
import '@eltonbautista/vue/style.css'       // component styles
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { CabButton, CabTextField } from '@eltonbautista/vue'
const email = ref('')
</script>

<template>
  <CabTextField v-model="email" label="Email" type="email" />
  <CabButton>Book a seat</CabButton>
</template>
```

## Accessibility

Every component follows a WAI-ARIA APG pattern and documents its keyboard map, focus behaviour and screen-reader output. Each one is tested in a real browser for keyboard interaction and axe violations. See the Storybook docs for each component's Accessibility section.

## For AI assistants

`@eltonbautista/mcp` is an MCP server generated from this package's source. It gives Claude Code and other assistants the exact props, tokens and examples.

MIT © Elton Bautista
