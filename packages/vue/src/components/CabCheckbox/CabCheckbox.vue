<script setup lang="ts">
/**
 * A checkbox for a yes/no choice that is confirmed later (e.g. on form submit).
 * Native `<input type="checkbox">` with a chunky custom box; native semantics are kept.
 */
import '../../styles/field.css'
import { useId } from 'vue'

defineOptions({ name: 'CabCheckbox' })

const props = withDefaults(defineProps<{
  /** Checked state (use `v-model`). */
  modelValue: boolean
  /** Visible label. Clicking it toggles the checkbox. */
  label: string
  /** Helper text linked with `aria-describedby`. */
  hint?: string
  /** Disables the checkbox. */
  disabled?: boolean
}>(), { disabled: false })

const emit = defineEmits<{
  /** Fired when the user toggles the checkbox, with the requested state. */
  'update:modelValue': [value: boolean]
}>()

const id = useId()
const hintId = `${id}-hint`

function onChange(event: Event) {
  const el = event.target as HTMLInputElement
  const requested = el.checked
  // Stay controlled: the DOM reflects modelValue until the parent updates it.
  el.checked = props.modelValue
  emit('update:modelValue', requested)
}
</script>

<template>
  <div class="cab-checkbox">
    <label :for="id" class="cab-checkbox__row">
      <input
        :id="id"
        class="cab-checkbox__input"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :aria-describedby="hint ? hintId : undefined"
        @change="onChange"
      >
      <span class="cab-checkbox__box" aria-hidden="true">
        <svg viewBox="0 0 16 16" focusable="false"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </span>
      <span class="cab-checkbox__label">{{ label }}</span>
    </label>
    <p v-if="hint" :id="hintId" class="cab-field__hint cab-checkbox__hint">{{ hint }}</p>
  </div>
</template>

<style>
.cab-checkbox { font-family: var(--cab-font-family-body); color: var(--cab-color-text-default); }
.cab-checkbox__row {
  position: relative;
  display: inline-flex; align-items: flex-start; gap: var(--cab-space-3);
  font-size: var(--cab-font-size-md); line-height: 1.4;
  cursor: pointer;
}
.cab-checkbox__input {
  position: absolute; inset: 0;
  width: 24px; height: 24px; margin: 0;
  opacity: 0; cursor: inherit;
}
.cab-checkbox__box {
  flex: none;
  display: grid; place-items: center;
  width: 24px; height: 24px;
  box-sizing: border-box;
  border: 2px solid var(--cab-color-border-strong);
  border-radius: 8px;
  background: var(--cab-color-bg-surface);
  color: var(--cab-color-text-on-primary);
  transition: background-color var(--cab-motion-duration-instant) var(--cab-motion-easing-standard),
    border-color var(--cab-motion-duration-instant) var(--cab-motion-easing-standard);
}
.cab-checkbox__box svg { width: 16px; height: 16px; opacity: 0; transform: scale(0.6);
  transition: opacity var(--cab-motion-duration-instant) var(--cab-motion-easing-standard),
    transform var(--cab-motion-duration-base) var(--cab-motion-easing-standard); }
.cab-checkbox__input:checked + .cab-checkbox__box {
  background: var(--cab-color-state-active-bg);
  border-color: var(--cab-color-state-active-base);
}
.cab-checkbox__input:checked + .cab-checkbox__box svg { opacity: 1; transform: none; }
.cab-checkbox__input:focus-visible + .cab-checkbox__box {
  outline: 3px solid var(--cab-color-focus-ring);
  outline-offset: 3px;
}
.cab-checkbox__row:hover .cab-checkbox__input:not(:disabled) + .cab-checkbox__box { border-color: var(--cab-color-text-default); }
.cab-checkbox__input:disabled + .cab-checkbox__box { background: var(--cab-color-bg-sunken); border-color: var(--cab-color-border-default); }
.cab-checkbox__input:disabled ~ .cab-checkbox__label { color: var(--cab-color-text-muted); }
.cab-checkbox__row:has(.cab-checkbox__input:disabled) { cursor: not-allowed; }
.cab-checkbox__hint { margin: var(--cab-space-1) 0 0; padding-inline-start: calc(24px + var(--cab-space-3)); }
@media (prefers-reduced-motion: reduce) {
  .cab-checkbox__box svg { transform: none; }
}
</style>
