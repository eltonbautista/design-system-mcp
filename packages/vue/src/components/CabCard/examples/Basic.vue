<!-- A content card with a tag, body text and an action. -->
<script setup lang="ts">
import { CabButton, CabCard } from '@cabinet-ds/vue'
</script>

<template>
  <div style="max-width: 360px">
    <CabCard title="Weekend game jam" :heading-level="2">
      <p>Two days of prototyping, playtesting and pizza. No experience needed.</p>
      <template #footer>
        <CabButton size="sm">Save a seat</CabButton>
        <span style="color: var(--cab-color-text-muted); font-size: var(--cab-font-size-sm)">12 seats left</span>
      </template>
    </CabCard>
  </div>
</template>
