<script setup lang="ts">
/**
 * A modal dialog for a short, focused task or a confirmation that must be answered before continuing.
 * Built on the native `<dialog>` with `showModal()`, so the page behind it is inert.
 */
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

defineOptions({ name: 'CabDialog' })

const props = withDefaults(defineProps<{
  /** Whether the dialog is open (use `v-model:open`). */
  open: boolean
  /** Visible title; also the dialog's accessible name. */
  title: string
  /** Optional one-line description, announced after the title. */
  description?: string
  /** Accessible name of the close button. */
  closeLabel?: string
}>(), { closeLabel: 'Close' })

const emit = defineEmits<{
  /** Fired with `false` when the user dismisses the dialog (Escape, close button, backdrop). */
  'update:open': [value: boolean]
}>()

defineSlots<{
  /** Dialog body. The first focusable element here receives focus on open. */
  default(): unknown
  /** Actions row, e.g. Cancel and Confirm buttons. */
  footer?(): unknown
}>()

const id = useId()
const titleId = `${id}-title`
const descId = `${id}-desc`
const dialogEl = ref<HTMLDialogElement>()
const bodyEl = ref<HTMLElement>()
const closeEl = ref<HTMLButtonElement>()
const closing = ref(false)
let returnTo: HTMLElement | null = null
let closeTimer: ReturnType<typeof setTimeout> | undefined

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const focusables = () => [...(dialogEl.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
  .filter(el => !el.hasAttribute('hidden') && el.getClientRects().length > 0)

function exitMs(): number {
  if (!dialogEl.value) return 0
  const v = getComputedStyle(dialogEl.value).getPropertyValue('--cab-motion-duration-exit').trim()
  return Number.parseFloat(v) || 0
}

async function show() {
  const el = dialogEl.value
  if (!el || el.open) return
  clearTimeout(closeTimer)
  closing.value = false
  returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
  el.showModal()
  await nextTick()
  const first = [...(bodyEl.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])][0]
  ;(first ?? closeEl.value)?.focus()
}

function hide() {
  const el = dialogEl.value
  if (!el || !el.open || closing.value) return
  closing.value = true
  const finish = () => {
    closing.value = false
    if (el.open) el.close()
    if (returnTo?.isConnected) returnTo.focus()
    returnTo = null
  }
  const ms = exitMs()
  if (ms > 0) closeTimer = setTimeout(finish, ms)
  else finish()
}

function requestClose() {
  emit('update:open', false)
}

function onCancel(e: Event) {
  // Escape: keep control of closing so the exit animation and focus return run.
  e.preventDefault()
  requestClose()
}

function onClick(e: MouseEvent) {
  // Clicks on the <dialog> element itself (not its content) land on the backdrop area.
  if (e.target === dialogEl.value) requestClose()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Tab') return
  const items = focusables()
  if (items.length === 0) return
  const first = items[0]!, last = items.at(-1)!
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

watch(() => props.open, v => (v ? show() : hide()))
onMounted(() => { if (props.open) show() })
onBeforeUnmount(() => {
  clearTimeout(closeTimer)
  if (dialogEl.value?.open) dialogEl.value.close()
})
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -- backdrop click is a mouse shortcut; Escape and the close button are the keyboard paths -->
  <dialog
    ref="dialogEl"
    :class="['cab-dialog', { 'cab-dialog--closing': closing }]"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descId : undefined"
    @cancel="onCancel"
    @click="onClick"
    @keydown="onKeydown"
  >
    <div class="cab-dialog__panel">
      <header class="cab-dialog__header">
        <h2 :id="titleId" class="cab-dialog__title">{{ title }}</h2>
        <button ref="closeEl" type="button" class="cab-dialog__close cab-focus" @click="requestClose">
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" /></svg>
          <span class="cab-visually-hidden">{{ closeLabel }}</span>
        </button>
      </header>
      <p v-if="description" :id="descId" class="cab-dialog__description">{{ description }}</p>
      <div ref="bodyEl" class="cab-dialog__body"><slot /></div>
      <footer v-if="$slots.footer" class="cab-dialog__footer"><slot name="footer" /></footer>
    </div>
  </dialog>
</template>

<style>
.cab-dialog {
  width: min(520px, calc(100vw - 2 * var(--cab-space-4)));
  max-height: calc(100dvh - 2 * var(--cab-space-6));
  padding: 0; border: 0;
  border-radius: var(--cab-radius-lg);
  background: var(--cab-color-bg-surface);
  color: var(--cab-color-text-default);
  font-family: var(--cab-font-family-body);
  box-shadow: 0 8px 0 var(--cab-color-shadow-ledge), 0 24px 48px -20px rgb(36 22 63 / 0.45);
  overflow: auto;
}
.cab-dialog::backdrop { background: rgb(36 22 63 / 0.45); }
.cab-dialog[open] { animation: cab-dialog-in var(--cab-motion-duration-overlay) var(--cab-motion-easing-standard); }
.cab-dialog[open]::backdrop { animation: cab-dialog-fade var(--cab-motion-duration-overlay) var(--cab-motion-easing-standard); }
.cab-dialog--closing[open] { animation: cab-dialog-out var(--cab-motion-duration-exit) var(--cab-motion-easing-standard) forwards; }
.cab-dialog--closing[open]::backdrop { animation: cab-dialog-fade var(--cab-motion-duration-exit) var(--cab-motion-easing-standard) reverse forwards; }
.cab-dialog__panel { padding: var(--cab-space-6); display: grid; gap: var(--cab-space-4); }
.cab-dialog__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--cab-space-4); }
.cab-dialog__title {
  margin: 0;
  font-family: var(--cab-font-family-display); font-weight: var(--cab-font-weight-heavy);
  font-size: var(--cab-font-size-xl); line-height: 1.2; text-wrap: balance;
}
.cab-dialog__description { margin: calc(-1 * var(--cab-space-2)) 0 0; color: var(--cab-color-text-muted); }
.cab-dialog__close {
  flex: none; display: grid; place-items: center;
  width: 40px; height: 40px; margin: calc(-1 * var(--cab-space-2)) calc(-1 * var(--cab-space-2)) 0 0;
  border: 0; border-radius: var(--cab-radius-sm);
  background: transparent; color: var(--cab-color-text-default); cursor: pointer;
}
.cab-dialog__close:hover { background: var(--cab-color-bg-sunken); }
.cab-dialog__close svg { width: 18px; height: 18px; }
.cab-dialog__footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--cab-space-3); margin-block-start: var(--cab-space-2); }
@keyframes cab-dialog-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } }
@keyframes cab-dialog-out { to { opacity: 0; transform: translateY(4px) scale(0.98); } }
@keyframes cab-dialog-fade { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .cab-dialog[open] { animation-name: cab-dialog-fade; }
  .cab-dialog--closing[open] { animation-name: cab-dialog-fade-out; }
}
@keyframes cab-dialog-fade-out { to { opacity: 0; } }
</style>
