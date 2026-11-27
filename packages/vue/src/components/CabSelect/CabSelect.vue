<script setup lang="ts">
/**
 * A select-only combobox: pick one value from a short list of options.
 * Follows the APG "Select-Only Combobox" pattern; focus never leaves the combobox.
 */
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import FieldError from '../FieldError.vue'
import { nextEnabledIndex, type Move } from '../../composables/nextEnabledIndex'

defineOptions({ name: 'CabSelect' })

export interface CabSelectOption {
  /** Value emitted through `v-model`. */
  value: string
  /** Visible option text (also used for typeahead). */
  label: string
  /** Disabled options are shown but cannot be chosen or reached with the keyboard. */
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  /** Selected value (use `v-model`). `null` shows the placeholder. */
  modelValue: string | null
  /** Visible label. */
  label: string
  /** The options, in display order. */
  options: CabSelectOption[]
  /** Text shown when nothing is selected. */
  placeholder?: string
  /** Helper text linked with `aria-describedby`. */
  hint?: string
  /** Error message; marks the combobox invalid and is announced. */
  error?: string
  /** Disables the select. */
  disabled?: boolean
}>(), { placeholder: 'Select…', disabled: false })

const emit = defineEmits<{
  /** Fired when an option is chosen, with its value. */
  'update:modelValue': [value: string]
}>()

const id = useId()
const labelId = `${id}-label`
const listId = `${id}-listbox`
const hintId = `${id}-hint`
const errorId = `${id}-error`
const optionId = (i: number) => `${id}-opt-${i}`

const open = ref(false)
const active = ref(-1)
const comboEl = ref<HTMLElement>()
const listEl = ref<HTMLElement>()

const disabledFlags = computed(() => props.options.map(o => !!o.disabled))
const selectedIndex = computed(() => props.options.findIndex(o => o.value === props.modelValue && !o.disabled))
const selected = computed(() => props.options[selectedIndex.value])
const describedBy = computed(() =>
  [props.hint && hintId, props.error && errorId].filter(Boolean).join(' ') || undefined)

function show(start: Move | 'selected' = 'selected') {
  if (props.disabled) return
  open.value = true
  if (start === 'selected' && selectedIndex.value >= 0) active.value = selectedIndex.value
  else active.value = nextEnabledIndex(disabledFlags.value, -1, start === 'selected' ? 'first' : start, false)
  scrollActive()
}
function hide() {
  open.value = false
}
function choose(i: number) {
  const o = props.options[i]
  if (!o || o.disabled) return
  if (o.value !== props.modelValue) emit('update:modelValue', o.value)
  hide()
}
function move(m: Move) {
  const i = nextEnabledIndex(disabledFlags.value, active.value, m, false)
  if (i >= 0) active.value = i
  scrollActive()
}
function scrollActive() {
  nextTick(() => document.getElementById(optionId(active.value))?.scrollIntoView({ block: 'nearest' }))
}

// Typeahead: characters typed within 500ms build a search string.
let buffer = ''
let bufferTimer: ReturnType<typeof setTimeout> | undefined
function typeahead(char: string) {
  clearTimeout(bufferTimer)
  buffer += char.toLowerCase()
  bufferTimer = setTimeout(() => { buffer = '' }, 500)
  const n = props.options.length
  const start = active.value < 0 ? 0 : active.value + (buffer.length === 1 ? 1 : 0)
  for (let k = 0; k < n; k++) {
    const i = (start + k) % n
    const o = props.options[i]!
    if (!o.disabled && o.label.toLowerCase().startsWith(buffer)) {
      active.value = i
      scrollActive()
      return
    }
  }
}
onBeforeUnmount(() => clearTimeout(bufferTimer))

function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  const { key, altKey } = e
  if (!open.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) { e.preventDefault(); show(); return }
    if (key === 'Home') { e.preventDefault(); show('first'); return }
    if (key === 'End') { e.preventDefault(); show('last'); return }
    if (key.length === 1 && !e.ctrlKey && !e.metaKey && !altKey) { show(); typeahead(key) }
    return
  }
  switch (key) {
    case 'ArrowDown': e.preventDefault(); move('next'); break
    case 'ArrowUp':
      e.preventDefault()
      if (altKey) choose(active.value)
      else move('prev')
      break
    case 'Home': e.preventDefault(); move('first'); break
    case 'End': e.preventDefault(); move('last'); break
    case 'PageDown': e.preventDefault(); for (let k = 0; k < 10; k++) move('next'); break
    case 'PageUp': e.preventDefault(); for (let k = 0; k < 10; k++) move('prev'); break
    case 'Enter': case ' ':
      e.preventDefault()
      if (key === ' ' && buffer) { typeahead(' '); break }
      if (active.value >= 0) choose(active.value)
      else hide()
      break
    case 'Escape': e.preventDefault(); hide(); break
    case 'Tab': if (active.value >= 0) choose(active.value); else hide(); break
    default:
      if (key.length === 1 && !e.ctrlKey && !e.metaKey && !altKey) typeahead(key)
  }
}

function onFocusout(e: FocusEvent) {
  const to = e.relatedTarget as Node | null
  if (!to || !listEl.value?.contains(to)) hide()
}
function onOptionClick(i: number) {
  choose(i)
  comboEl.value?.focus()
}

watch(() => props.options, () => { if (active.value >= props.options.length) active.value = -1 })
</script>

<template>
  <div class="cab-field cab-select" :class="{ 'cab-select--open': open }">
    <span :id="labelId" class="cab-field__label">{{ label }}</span>
    <p v-if="hint" :id="hintId" class="cab-field__hint">{{ hint }}</p>
    <div class="cab-select__anchor">
      <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- focusable via the bound :tabindex (0 unless disabled) -->
      <div
        ref="comboEl"
        role="combobox"
        class="cab-control cab-select__combo cab-focus"
        :tabindex="disabled ? -1 : 0"
        aria-haspopup="listbox"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="listId"
        :aria-labelledby="labelId"
        :aria-activedescendant="open && active >= 0 ? optionId(active) : undefined"
        :aria-describedby="describedBy"
        :aria-invalid="error ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        @click="open ? hide() : show()"
        @keydown="onKeydown"
        @focusout="onFocusout"
      >
        <span :class="['cab-select__value', { 'cab-select__value--placeholder': !selected }]">{{ selected?.label ?? placeholder }}</span>
        <svg class="cab-select__chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <ul
        :id="listId"
        ref="listEl"
        role="listbox"
        class="cab-select__list"
        :aria-labelledby="labelId"
        tabindex="-1"
        :hidden="!open"
        @mousedown.prevent
      >
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/interactive-supports-focus -- APG activedescendant: options are never focused; the combobox handles all keys -->
        <li
          v-for="(o, i) in options"
          :id="optionId(i)"
          :key="o.value"
          role="option"
          :class="['cab-select__option', { 'cab-select__option--active': i === active }]"
          :aria-selected="i === selectedIndex ? 'true' : 'false'"
          :aria-disabled="o.disabled ? 'true' : undefined"
          @click="onOptionClick(i)"
          @mousemove="!o.disabled && (active = i)"
        >
          <span>{{ o.label }}</span>
          <svg v-if="i === selectedIndex" class="cab-select__check" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </li>
      </ul>
    </div>
    <FieldError v-if="error" :id="errorId">{{ error }}</FieldError>
  </div>
</template>

<style>
.cab-select__anchor { position: relative; }
.cab-select__combo {
  display: flex; align-items: center; justify-content: space-between; gap: var(--cab-space-3);
  cursor: pointer; user-select: none;
}
.cab-select__combo[aria-disabled='true'] { background: var(--cab-color-bg-sunken); color: var(--cab-color-text-muted); cursor: not-allowed; }
.cab-select__value--placeholder { color: var(--cab-color-text-muted); }
.cab-select__chevron { flex: none; width: 18px; height: 18px;
  transition: transform var(--cab-motion-duration-base) var(--cab-motion-easing-standard); }
.cab-select--open .cab-select__chevron { transform: rotate(180deg); }
.cab-select__list {
  position: absolute; z-index: 20; inset-inline: 0; top: calc(100% + var(--cab-space-2));
  max-height: 280px; overflow-y: auto;
  margin: 0; padding: var(--cab-space-2); list-style: none;
  background: var(--cab-color-bg-surface);
  border: 2px solid var(--cab-color-border-strong);
  border-radius: var(--cab-radius-md);
  box-shadow: 0 6px 0 var(--cab-color-shadow-ledge), 0 16px 32px -16px rgb(36 22 63 / 0.35);
}
.cab-select__list:not([hidden]) { animation: cab-pop-in var(--cab-motion-duration-base) var(--cab-motion-easing-standard); }
.cab-select__option {
  display: flex; align-items: center; justify-content: space-between; gap: var(--cab-space-3);
  padding: var(--cab-space-3) var(--cab-space-3);
  border-radius: var(--cab-radius-sm);
  cursor: pointer;
}
.cab-select__option--active { background: var(--cab-color-bg-sunken); outline: 2px solid var(--cab-color-focus-ring); outline-offset: -2px; }
.cab-select__option[aria-selected='true'] { font-weight: var(--cab-font-weight-bold); }
.cab-select__option[aria-disabled='true'] { color: var(--cab-color-text-muted); cursor: not-allowed; text-decoration: line-through; }
.cab-select__check { width: 16px; height: 16px; color: var(--cab-color-state-active-bg); }
@keyframes cab-pop-in { from { opacity: 0; transform: translateY(-4px); } }
@media (prefers-reduced-motion: reduce) {
  .cab-select__list:not([hidden]) { animation-name: cab-fade-in; }
  .cab-select__chevron { transition: none; }
}
@keyframes cab-fade-in { from { opacity: 0; } }
</style>
