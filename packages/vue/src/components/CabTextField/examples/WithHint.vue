<!-- A required email field with hint text. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabTextField } from '@eltonbautista/vue'

const email = ref('')
</script>

<template>
  <CabTextField v-model="email" label="Email" type="email" autocomplete="email" required hint="We only use it to send your ticket." />
</template>
