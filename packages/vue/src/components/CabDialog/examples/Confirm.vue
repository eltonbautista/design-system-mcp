<!-- A confirmation with no form fields; focus starts on the first action. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabButton, CabDialog } from '@eltonbautista/vue'

const open = ref(false)
</script>

<template>
  <CabButton variant="secondary" @click="open = true">Leave the waitlist</CabButton>
  <CabDialog v-model:open="open" title="Leave the waitlist?">
    <p style="margin: 0">You'll lose your place. You can join again later, at the back of the queue.</p>
    <template #footer>
      <CabButton variant="ghost" @click="open = false">Stay on it</CabButton>
      <CabButton @click="open = false">Leave waitlist</CabButton>
    </template>
  </CabDialog>
</template>
