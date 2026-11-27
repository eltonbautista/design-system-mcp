<!-- Three tabs with automatic activation (selection follows focus). -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabTabs } from '@eltonbautista/vue'

const tab = ref('schedule')
const tabs = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'venue', label: 'Venue' },
  { id: 'faq', label: 'FAQ' },
]
const copy: Record<string, string> = {
  schedule: 'Saturday 10:00 to 17:00: prototyping. Sunday 10:00 to 15:00: playtests and demos.',
  venue: 'The Old Arcade, 12 Pinball Lane. Step-free entrance on the east side.',
  faq: 'Bring a laptop if you have one. Paper prototyping kits are provided.',
}
</script>

<template>
  <CabTabs v-model="tab" :tabs="tabs" label="Workshop details">
    <template #panel="{ tab: t }">
      <p style="margin: 0">{{ copy[t.id] }}</p>
    </template>
  </CabTabs>
</template>
