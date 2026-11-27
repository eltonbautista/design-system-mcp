<!-- Showing a validation error that names the problem and the fix. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabTextField } from '@cabinet-ds/vue'

const email = ref('pixel@')
</script>

<template>
  <CabTextField v-model="email" label="Email" type="email" error="Add the part after @, like pixel@example.com." />
</template>
