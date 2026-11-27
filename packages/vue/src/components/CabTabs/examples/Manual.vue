<!-- Manual activation (arrows move focus, Enter or Space selects) and a disabled tab. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabTabs } from '@eltonbautista/vue'

const tab = ref('day1')
const tabs = [
  { id: 'day1', label: 'Day 1' },
  { id: 'day2', label: 'Day 2' },
  { id: 'day3', label: 'Day 3 (sold out)', disabled: true },
]
</script>

<template>
  <CabTabs v-model="tab" :tabs="tabs" label="Workshop days" activation="manual">
    <template #panel="{ tab: t }">
      <p style="margin: 0">Sessions for {{ t.label }}.</p>
    </template>
  </CabTabs>
</template>
