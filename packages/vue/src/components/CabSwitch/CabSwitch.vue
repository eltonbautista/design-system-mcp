<script setup lang="ts">
/**
 * An on/off switch for a setting that takes effect immediately.
 * A `<button role="switch">` labelled by a native `<label>`.
 */
import { useId } from 'vue'

defineOptions({ name: 'CabSwitch' })

const props = withDefaults(defineProps<{
  /** On/off state (use `v-model`). */
  modelValue: boolean
  /** Visible label naming the setting, e.g. "Email reminders". */
  label: string
  /** Disables the switch. */
  disabled?: boolean
}>(), { disabled: false })

const emit = defineEmits<{
  /** Fired when toggled, with the new state. */
  'update:modelValue': [value: boolean]
}>()

const id = useId()
</script>

<template>
  <div class="cab-switch">
    <label :for="id" class="cab-switch__label">{{ label }}</label>
    <button
      :id="id"
      type="button"
      role="switch"
      class="cab-switch__track cab-focus"
      :aria-checked="modelValue ? 'true' : 'false'"
      :disabled="disabled"
      @click="emit('update:modelValue', !props.modelValue)"
    >
      <span class="cab-switch__thumb" aria-hidden="true" />
    </button>
  </div>
</template>

<style>
.cab-switch {
  display: inline-flex; align-items: center; gap: var(--cab-space-3);
  font-family: var(--cab-font-family-body); font-size: var(--cab-font-size-md);
  color: var(--cab-color-text-default);
}
.cab-switch__label { cursor: pointer; }
.cab-switch__track {
  --_travel: 22px;
  position: relative; flex: none;
  width: 52px; height: 30px; padding: 0;
  border: 2px solid var(--cab-color-border-strong);
  border-radius: var(--cab-radius-pill);
  background: var(--cab-color-bg-sunken);
  cursor: pointer;
  transition: background-color var(--cab-motion-duration-base) var(--cab-motion-easing-standard),
    border-color var(--cab-motion-duration-base) var(--cab-motion-easing-standard);
}
.cab-switch__thumb {
  position: absolute; top: 2px; left: 2px;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--cab-color-bg-surface);
  box-shadow: 0 2px 0 var(--cab-color-border-strong);
  transition: transform var(--cab-motion-duration-base) var(--cab-motion-easing-standard),
    background-color var(--cab-motion-duration-base) var(--cab-motion-easing-standard);
}
.cab-switch__track[aria-checked='true'] {
  background: var(--cab-color-state-active-bg);
  border-color: var(--cab-color-state-active-base);
}
.cab-switch__track[aria-checked='true'] .cab-switch__thumb {
  transform: translateX(var(--_travel));
  background: var(--cab-color-highlight-bg);
  box-shadow: 0 2px 0 var(--cab-color-highlight-base);
}
.cab-switch__track:hover:not(:disabled) { border-color: var(--cab-color-text-default); }
.cab-switch__track:disabled { cursor: not-allowed; opacity: 0.55; }
.cab-switch:has(:disabled) .cab-switch__label { color: var(--cab-color-text-muted); cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) {
  .cab-switch__thumb { transition-property: background-color; }
}
</style>
