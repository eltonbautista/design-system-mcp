<!-- A required select showing a validation error. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabSelect } from '@cabinet-ds/vue'

const track = ref<string | null>(null)
const options = [
  { value: 'board', label: 'Board games' },
  { value: 'digital', label: 'Digital games' },
  { value: 'larp', label: 'Live-action' },
]
</script>

<template>
  <div style="max-width: 320px">
    <CabSelect v-model="track" label="Track" :options="options" error="Choose a track so we can save you a seat." />
  </div>
</template>
