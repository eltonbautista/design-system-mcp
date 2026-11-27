<script setup lang="ts">
/**
 * A content container with a soft ledge, for grouping a title, media, text and actions.
 * Not interactive by itself; pass `href` to make the whole card a link through its title.
 */
import '../../styles/focus.css'
import { computed, useId } from 'vue'

defineOptions({ name: 'CabCard' })

const props = withDefaults(defineProps<{
  /** Element to render. `article` for self-contained content (default), `section` or `div` otherwise. */
  as?: 'article' | 'section' | 'div'
  /** Card title, rendered as a heading. */
  title?: string
  /** Heading level for the title, to fit the page outline. */
  headingLevel?: 2 | 3 | 4
  /** Makes the title a link and stretches its hit area over the whole card. */
  href?: string
}>(), { as: 'article', headingLevel: 3 })

defineSlots<{
  /** Image or illustration above the content. Give images meaningful `alt` text, or `alt=""` if decorative. */
  media?(): unknown
  /** Body content. */
  default?(): unknown
  /** Actions or meta row at the bottom. */
  footer?(): unknown
}>()

const titleId = `${useId()}-title`
const labelled = computed(() => props.title && props.as !== 'div' ? titleId : undefined)
</script>

<template>
  <component :is="as" :class="['cab-card', { 'cab-card--link': href }]" :aria-labelledby="labelled">
    <div v-if="$slots.media" class="cab-card__media"><slot name="media" /></div>
    <div class="cab-card__content">
      <component :is="`h${headingLevel}`" v-if="title" :id="titleId" class="cab-card__title">
        <a v-if="href" :href="href" class="cab-card__link cab-focus">{{ title }}</a>
        <template v-else>{{ title }}</template>
      </component>
      <div v-if="$slots.default" class="cab-card__body"><slot /></div>
      <div v-if="$slots.footer" class="cab-card__footer"><slot name="footer" /></div>
    </div>
  </component>
</template>

<style>
.cab-card {
  position: relative;
  display: flex; flex-direction: column;
  overflow: clip;
  border-radius: var(--cab-radius-lg);
  background: var(--cab-color-bg-surface);
  color: var(--cab-color-text-default);
  font-family: var(--cab-font-family-body);
  box-shadow: var(--cab-shadow-ledge);
  margin-block-end: 6px;
}
.cab-card__media > :is(img, picture, svg, video) { display: block; width: 100%; height: auto; }
.cab-card__content { display: grid; gap: var(--cab-space-3); padding: var(--cab-space-5); }
.cab-card__title {
  margin: 0;
  font-family: var(--cab-font-family-display); font-weight: var(--cab-font-weight-heavy);
  font-size: var(--cab-font-size-lg); line-height: 1.25; text-wrap: balance;
}
.cab-card__body { color: var(--cab-color-text-muted); line-height: 1.5; }
.cab-card__body > :first-child { margin-block-start: 0; }
.cab-card__body > :last-child { margin-block-end: 0; }
.cab-card__footer { display: flex; flex-wrap: wrap; align-items: center; gap: var(--cab-space-3); margin-block-start: var(--cab-space-2); }

/* Stretched link: the title link's ::after covers the card, so the whole card is one target. */
.cab-card__link { color: inherit; text-decoration: none; border-radius: var(--cab-radius-sm); }
.cab-card__link::after { content: ''; position: absolute; inset: 0; border-radius: var(--cab-radius-lg); }
.cab-card--link { transition: box-shadow var(--cab-motion-duration-base) var(--cab-motion-easing-standard); }
.cab-card--link:hover { box-shadow: var(--cab-shadow-ledge), 0 12px 24px -12px rgb(36 22 63 / 0.3); }
.cab-card--link:hover .cab-card__link { text-decoration: underline; text-underline-offset: 0.2em; text-decoration-thickness: 2px; }
.cab-card--link:has(.cab-card__link:focus-visible) { outline: 3px solid var(--cab-color-focus-ring); outline-offset: 3px; }
.cab-card__link:focus-visible { outline: none; }
</style>
