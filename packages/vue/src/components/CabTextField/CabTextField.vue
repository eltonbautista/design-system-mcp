<script setup lang="ts">
/**
 * A single-line text input with a visible label, optional hint and an error message.
 * Errors are announced through `aria-describedby` and marked with `aria-invalid`.
 */
import '../../styles/focus.css'
import '../../styles/field.css'
import { computed, useId } from 'vue'
import FieldError from '../FieldError.vue'

defineOptions({ name: 'CabTextField' })

const props = withDefaults(defineProps<{
  /** Current value (use `v-model`). */
  modelValue: string
  /** Visible label. Required: placeholders are not labels. */
  label: string
  /** Helper text shown under the label and announced after it. */
  hint?: string
  /** Error message. When set, the field is marked invalid and the message is announced. */
  error?: string
  /** Native input type. */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'
  /** Marks the field required (native `required` plus a visual asterisk). */
  required?: boolean
  /** Disables the field. */
  disabled?: boolean
  /** Native `autocomplete` token, e.g. `email` or `name`. */
  autocomplete?: string
  /** Placeholder example text. Never a substitute for `label` or `hint`. */
  placeholder?: string
}>(), { type: 'text', required: false, disabled: false })

const emit = defineEmits<{
  /** Fired on every input with the new value. */
  'update:modelValue': [value: string]
}>()

const id = useId()
const hintId = `${id}-hint`
const errorId = `${id}-error`
const describedBy = computed(() =>
  [props.hint && hintId, props.error && errorId].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div class="cab-field cab-text-field">
    <label :for="id" class="cab-field__label">
      {{ label }}<span v-if="required" class="cab-field__required" aria-hidden="true">*</span>
    </label>
    <p v-if="hint" :id="hintId" class="cab-field__hint">{{ hint }}</p>
    <input
      :id="id"
      class="cab-control cab-focus"
      :type="type"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <FieldError v-if="error" :id="errorId">{{ error }}</FieldError>
  </div>
</template>
