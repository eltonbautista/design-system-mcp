<!-- A group of checkboxes inside a fieldset, one with a hint. -->
<script setup lang="ts">
import { ref } from 'vue'
import { CabCheckbox } from '@cabinet-ds/vue'

const lunch = ref(true)
const parking = ref(false)
</script>

<template>
  <fieldset style="border: 0; padding: 0; margin: 0; display: grid; gap: var(--cab-space-3)">
    <legend style="font-weight: var(--cab-font-weight-bold); margin-block-end: var(--cab-space-3)">Extras</legend>
    <CabCheckbox v-model="lunch" label="Lunch on both days" hint="Vegetarian and vegan options included." />
    <CabCheckbox v-model="parking" label="Parking pass" />
  </fieldset>
</template>
