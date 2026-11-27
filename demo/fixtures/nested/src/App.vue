<script setup lang="ts">
import { ref } from 'vue'
import { CabButton, CabTabs, CabTextField } from '@eltonbautista/vue'
const tab = ref('a')
const v = ref('')
</script>

<template>
  <main>
    <CabTabs v-model="tab" :tabs="[{ id: 'a', label: 'A' }]" label="Tabs">
      <template #panel="{ tab: t }">
        <p>{{ t.label }}</p>
      </template>
    </CabTabs>
    <CabTextField
      v-model="v"
      label="Name"
      colour="red"
    />
    <button>Raw after slot</button>
    <CabButton @click="() => {}">Go</CabButton>
  </main>
</template>
