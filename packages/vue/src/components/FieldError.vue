<script setup lang="ts">
/** Internal: an error message with a drawn warning icon, so colour is never the only signal. */
import '../styles/field.css'
defineProps<{ id: string }>()
</script>

<template>
  <p :id="id" class="cab-field__error">
    <svg class="cab-field__error-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="M8 4.5v4.2M8 11.2v.3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span><slot /></span>
  </p>
</template>
