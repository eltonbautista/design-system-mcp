<!-- A dialog opened from a button, with a form field and actions. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabButton, CabDialog, CabTextField } from '@eltonbautista/vue'

const open = ref(false)
const name = ref('')
</script>

<template>
  <CabButton @click="open = true">Save my seat</CabButton>
  <CabDialog v-model:open="open" title="Save your seat?" description="We'll hold it for 24 hours.">
    <CabTextField v-model="name" label="Name on the badge" autocomplete="name" />
    <template #footer>
      <CabButton variant="ghost" @click="open = false">Cancel</CabButton>
      <CabButton @click="open = false">Hold my seat</CabButton>
    </template>
  </CabDialog>
</template>
