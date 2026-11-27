<!-- All three variants, plus loading and disabled states. -->
<script setup lang="ts">
import { CabButton } from '@cabinet-ds/vue'
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: var(--cab-space-4); align-items: center">
    <CabButton variant="primary">Book a seat</CabButton>
    <CabButton variant="secondary">Add to calendar</CabButton>
    <CabButton variant="ghost">Maybe later</CabButton>
    <CabButton loading>Saving</CabButton>
    <CabButton disabled>Sold out</CabButton>
  </div>
</template>
