<script setup lang="ts">
/**
 * Tabs that switch between related panels of content in place.
 * Follows the APG Tabs pattern with roving tabindex and automatic or manual activation.
 */
import { computed, nextTick, ref, useId } from 'vue'
import { nextEnabledIndex, type Move } from '../../composables/nextEnabledIndex'

defineOptions({ name: 'CabTabs' })

export interface CabTab {
  /** Stable id used as the `v-model` value. */
  id: string
  /** Visible tab text. */
  label: string
  /** Disabled tabs are skipped by the arrow keys and cannot be selected. */
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  /** The selected tab's id (use `v-model`). Falls back to the first enabled tab if missing or disabled. */
  modelValue?: string
  /** The tabs, in order. */
  tabs: CabTab[]
  /** Accessible name for the tab list, e.g. "Workshop details". */
  label: string
  /** `automatic` selects a tab as soon as it gets focus; `manual` waits for Enter or Space. */
  activation?: 'automatic' | 'manual'
}>(), { activation: 'automatic' })

const emit = defineEmits<{
  /** Fired when a tab is selected, with its id. */
  'update:modelValue': [id: string]
}>()

defineSlots<{
  /** Content for each tab's panel. Rendered once per tab; only the selected panel is visible. */
  panel(props: { tab: CabTab }): unknown
}>()

const uid = useId()
const tabId = (t: CabTab) => `${uid}-tab-${t.id}`
const panelId = (t: CabTab) => `${uid}-panel-${t.id}`
const tabEls = ref<HTMLElement[]>([])

const selectedId = computed(() => {
  const hit = props.tabs.find(t => t.id === props.modelValue && !t.disabled)
  return (hit ?? props.tabs.find(t => !t.disabled))?.id
})

function select(t: CabTab) {
  if (t.disabled || t.id === props.modelValue) return
  emit('update:modelValue', t.id)
}

const KEYS: Record<string, Move> = { ArrowRight: 'next', ArrowLeft: 'prev', Home: 'first', End: 'last' }

async function onKeydown(event: KeyboardEvent) {
  const move = KEYS[event.key]
  if (!move) return
  event.preventDefault()
  const current = tabEls.value.indexOf(document.activeElement as HTMLElement)
  const i = nextEnabledIndex(props.tabs.map(t => !!t.disabled), current, move, true)
  const tab = props.tabs[i]
  if (!tab) return
  tabEls.value[i]?.focus()
  if (props.activation === 'automatic') {
    select(tab)
    await nextTick()
  }
}
</script>

<template>
  <div class="cab-tabs">
    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- APG: the tabs take focus (roving tabindex), not the tablist container -->
    <div role="tablist" :aria-label="label" class="cab-tabs__list" @keydown="onKeydown">
      <button
        v-for="tab in tabs"
        :id="tabId(tab)"
        :key="tab.id"
        ref="tabEls"
        type="button"
        role="tab"
        class="cab-tabs__tab cab-focus"
        :aria-selected="tab.id === selectedId ? 'true' : 'false'"
        :aria-controls="panelId(tab)"
        :aria-disabled="tab.disabled ? 'true' : undefined"
        :tabindex="tab.id === selectedId ? 0 : -1"
        @click="select(tab)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="tab in tabs"
      :id="panelId(tab)"
      :key="tab.id"
      role="tabpanel"
      class="cab-tabs__panel cab-focus"
      :aria-labelledby="tabId(tab)"
      :hidden="tab.id !== selectedId"
      tabindex="0"
    >
      <slot name="panel" :tab="tab" />
    </div>
  </div>
</template>

<style>
.cab-tabs { font-family: var(--cab-font-family-body); color: var(--cab-color-text-default); }
.cab-tabs__list {
  display: flex; flex-wrap: wrap; gap: var(--cab-space-2);
  padding-block-end: var(--cab-space-1);
}
.cab-tabs__tab {
  padding: var(--cab-space-2) var(--cab-space-4);
  margin-block-end: 3px;
  border: 0;
  border-radius: var(--cab-radius-md);
  background: var(--cab-color-bg-sunken);
  color: var(--cab-color-text-default);
  font: inherit; font-weight: var(--cab-font-weight-medium); font-size: var(--cab-font-size-md);
  cursor: pointer;
  transition: background-color var(--cab-motion-duration-base) var(--cab-motion-easing-standard),
    color var(--cab-motion-duration-base) var(--cab-motion-easing-standard),
    box-shadow var(--cab-motion-duration-base) var(--cab-motion-easing-standard);
}
.cab-tabs__tab:hover:not([aria-selected='true'], [aria-disabled='true']) {
  background: var(--cab-color-border-default);
}
.cab-tabs__tab[aria-selected='true'] {
  background: var(--cab-color-state-active-bg);
  color: var(--cab-color-text-on-primary);
  font-weight: var(--cab-font-weight-bold);
  box-shadow: 0 3px 0 var(--cab-color-state-active-base);
}
.cab-tabs__tab[aria-disabled='true'] { color: var(--cab-color-text-muted); cursor: not-allowed; text-decoration: line-through; }
.cab-tabs__panel { padding-block: var(--cab-space-4); border-radius: var(--cab-radius-sm); }
</style>
