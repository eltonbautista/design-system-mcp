<!-- A select bound with v-model, with a hint and a disabled option. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabSelect } from '@eltonbautista/vue'

const level = ref<string | null>(null)
const options = [
  { value: 'new', label: 'New to game design' },
  { value: 'hobby', label: 'Hobbyist' },
  { value: 'student', label: 'Student (waitlist only)', disabled: true },
  { value: 'pro', label: 'Professional' },
]
</script>

<template>
  <div style="max-width: 320px">
    <CabSelect v-model="level" label="Experience level" :options="options" hint="Helps us pair you with a teammate." />
  </div>
</template>
