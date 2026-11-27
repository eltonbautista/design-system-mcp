<script setup lang="ts">
/**
 * An arcade-style button with a glossy face that presses into its coloured base.
 * Renders a native `<button>`; use it for actions, not navigation.
 */
defineOptions({ name: 'CabButton' })

const props = withDefaults(defineProps<{
  /** Visual weight. `primary` is the one main action on a view; `secondary` supports it; `ghost` is low emphasis. */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Control size. */
  size?: 'sm' | 'md' | 'lg'
  /** Native button type. Defaults to `button` so it never submits a form by accident. */
  type?: 'button' | 'submit' | 'reset'
  /** Disables the button using the native `disabled` attribute. */
  disabled?: boolean
  /** Shows a spinner, sets `aria-busy`, and ignores clicks while staying focusable. */
  loading?: boolean
}>(), { variant: 'primary', size: 'md', type: 'button', disabled: false, loading: false })

const emit = defineEmits<{
  /** Fired on activation (pointer, Enter or Space) unless loading or disabled. */
  click: [event: MouseEvent]
}>()

function onClick(event: MouseEvent) {
  if (props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-busy="loading ? 'true' : undefined"
    :class="['cab-button', 'cab-focus', `cab-button--${variant}`, `cab-button--${size}`, { 'cab-button--loading': loading }]"
    @click="onClick"
  >
    <span v-if="loading" class="cab-button__spinner" aria-hidden="true" />
    <span class="cab-button__label"><slot /></span>
  </button>
</template>

<style>
.cab-button {
  --_face: var(--cab-color-action-primary-bg);
  --_base: var(--cab-color-action-primary-base);
  --_ink: var(--cab-color-text-on-primary);
  --_depth: var(--cab-motion-distance-press);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--cab-space-2);
  margin-block-end: var(--_depth);
  border: 0;
  border-radius: var(--cab-radius-md);
  background: var(--_face);
  color: var(--_ink);
  font-family: var(--cab-font-family-body);
  font-weight: var(--cab-font-weight-bold);
  line-height: 1.2;
  cursor: pointer;
  box-shadow:
    0 var(--_depth) 0 var(--_base),
    inset 0 2px 0 rgb(255 255 255 / 0.35);
  transition:
    transform var(--cab-motion-duration-instant) var(--cab-motion-easing-standard),
    box-shadow var(--cab-motion-duration-instant) var(--cab-motion-easing-standard),
    filter var(--cab-motion-duration-base) var(--cab-motion-easing-standard);
  -webkit-tap-highlight-color: transparent;
}
.cab-button--sm { padding: var(--cab-space-2) var(--cab-space-3); font-size: var(--cab-font-size-sm); border-radius: var(--cab-radius-sm); }
.cab-button--md { padding: var(--cab-space-3) var(--cab-space-5); font-size: var(--cab-font-size-md); }
.cab-button--lg { padding: var(--cab-space-4) var(--cab-space-6); font-size: var(--cab-font-size-lg); border-radius: var(--cab-radius-lg); }

.cab-button--secondary {
  --_face: var(--cab-color-action-secondary-bg);
  --_base: var(--cab-color-action-secondary-base);
  --_ink: var(--cab-color-text-on-secondary);
}
.cab-button--ghost {
  --_face: transparent;
  --_ink: var(--cab-color-text-default);
  box-shadow: inset 0 0 0 2px var(--cab-color-border-strong);
}

/* Hover: a soft glow from the face colour. The element itself never moves. */
.cab-button:hover:not(:disabled) {
  filter: drop-shadow(0 6px 10px color-mix(in srgb, var(--_face) 45%, transparent));
}
.cab-button--ghost:hover:not(:disabled) {
  filter: none;
  background: var(--cab-color-bg-sunken);
}

/* Press: the face travels down into its base. 0px under reduced motion (token). */
.cab-button:active:not(:disabled, .cab-button--loading) {
  transform: translateY(var(--cab-motion-distance-press));
  box-shadow: 0 0 0 var(--_base), inset 0 2px 0 rgb(255 255 255 / 0.2);
}
.cab-button--ghost:active:not(:disabled) {
  box-shadow: inset 0 0 0 2px var(--cab-color-border-strong);
}

.cab-button:disabled {
  cursor: not-allowed;
  --_face: var(--cab-color-bg-sunken);
  --_base: var(--cab-color-border-default);
  --_ink: var(--cab-color-text-muted);
}
.cab-button--loading { cursor: progress; }

.cab-button__spinner {
  width: 1em; height: 1em;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  animation: cab-spin 700ms linear infinite;
}
@keyframes cab-spin { to { transform: rotate(1turn); } }
@media (prefers-reduced-motion: reduce) {
  .cab-button__spinner { animation-duration: 2s; }
}
</style>
