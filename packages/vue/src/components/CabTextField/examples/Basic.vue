<!-- A labelled text field bound with v-model. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabTextField } from '@cabinet-ds/vue'

const name = ref('')
</script>

<template>
  <CabTextField v-model="name" label="Your name" autocomplete="name" />
</template>
