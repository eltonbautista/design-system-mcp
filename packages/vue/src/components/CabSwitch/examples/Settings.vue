<!-- A short list of instant settings, one disabled. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabSwitch } from '@eltonbautista/vue'

const newsletter = ref(false)
const sounds = ref(true)
</script>

<template>
  <div style="display: grid; gap: var(--cab-space-4); justify-items: start">
    <CabSwitch v-model="newsletter" label="Monthly newsletter" />
    <CabSwitch v-model="sounds" label="Arcade sounds" />
    <CabSwitch :model-value="false" label="Live captions (coming soon)" disabled />
  </div>
</template>
