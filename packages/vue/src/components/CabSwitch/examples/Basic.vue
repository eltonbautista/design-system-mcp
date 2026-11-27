<!-- A switch bound with v-model. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabSwitch } from '@cabinet-ds/vue'

const reminders = ref(true)
</script>

<template>
  <CabSwitch v-model="reminders" label="Workshop reminders" />
</template>
