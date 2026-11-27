<!-- A single checkbox bound with v-model. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabCheckbox } from '@cabinet-ds/vue'

const agreed = ref(false)
</script>

<template>
  <CabCheckbox v-model="agreed" label="I agree to the code of conduct" />
</template>
