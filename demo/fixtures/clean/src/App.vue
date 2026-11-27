<script setup lang="ts">
import { ref } from 'vue'
import { CabButton, CabCard, CabTextField, CabSelect } from '@cabinet-ds/vue'
const name = ref('')
const level = ref<string | null>(null)
const open = ref(false)
</script>

<template>
  <main class="page">
    <CabCard title="Weekend game jam" :heading-level="1">
      <CabTextField v-model="name" label="Name" autocomplete="name" />
      <CabSelect v-model="level" label="Level" :options="[{ value: 'new', label: 'New' }]" />
      <CabButton class="cta" variant="primary" @click="open = true">Sign up</CabButton>
    </CabCard>
  </main>
</template>

<style scoped>
.page { padding: var(--cab-space-6); background: var(--cab-color-bg-canvas); }
</style>
