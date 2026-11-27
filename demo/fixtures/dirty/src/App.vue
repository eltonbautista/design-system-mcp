<script setup lang="ts">
import { CabButton } from '@eltonbautista/vue'
</script>

<template>
  <main>
    <button style="color:#f00">Raw</button>
    <CabButton tone="x" size="lg">Go</CabButton>
    <CabMegaHero />
  </main>
</template>

<style>
main { background: rgb(255, 0, 0); }
</style>
<style scoped>
.x { color: var(--cab-color-danger, red); padding: var(--cab-space-4); }
</style>
