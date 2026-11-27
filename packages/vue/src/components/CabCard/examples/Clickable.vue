<!-- A whole card that links somewhere, using href (stretched title link). -->
<script setup lang="ts">
import { CabCard } from '@eltonbautista/vue'
</script>

<template>
  <div style="display: grid; gap: var(--cab-space-5); grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); max-width: 760px">
    <CabCard title="Board game design" href="#board" :heading-level="2">
      <p>Cards, dice and rules that fit on one page.</p>
    </CabCard>
    <CabCard title="Digital prototyping" href="#digital" :heading-level="2">
      <p>Make something playable in a browser by Sunday.</p>
    </CabCard>
  </div>
</template>
