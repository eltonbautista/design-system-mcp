<script setup lang="ts">
/**
 * Storybook welcome: the arcade cabinet "powers on". Buttons light up one by one
 * (staggered glow, ≤ 800ms total). Under prefers-reduced-motion they are simply lit.
 * The default (no-JS) state is fully lit; GSAP only animates *from* the off state.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { gsap } from 'gsap'
import { CabButton, CabCard } from '@eltonbautista/vue'

const root = ref<HTMLElement>()
let mm: gsap.MatchMedia | undefined

function powerOn() {
  mm?.revert()
  mm = gsap.matchMedia(root.value)
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo('.welcome__key',
      { opacity: 0.35, filter: 'saturate(0) brightness(0.85)' },
      {
        opacity: 1,
        filter: 'saturate(1) brightness(1)',
        duration: 0.32,
        stagger: 0.07,
        ease: 'expo.out',
        clearProps: 'opacity,filter', // hand control back to the component CSS (hover glow) when done
      })
  })
}

onMounted(powerOn)
onUnmounted(() => mm?.revert())

const components = [
  ['CabButton', 'Arcade buttons that press into their base.'],
  ['CabTextField', 'Labelled input with hint and error.'],
  ['CabCheckbox', 'Native checkbox, chunky box.'],
  ['CabSwitch', 'Instant on/off setting.'],
  ['CabSelect', 'APG select-only combobox.'],
  ['CabTabs', 'Roving focus, auto or manual activation.'],
  ['CabDialog', 'Native modal dialog, focus returned.'],
  ['CabCard', 'Content card, optional whole-card link.'],
] as const
</script>

<template>
  <main ref="root" class="welcome">
    <header class="welcome__marquee">
      <h1 class="welcome__title">Cabinet</h1>
      <p class="welcome__lede">
        A small Vue 3 design system with an arcade-cabinet feel. Eight components, each with a tested
        accessibility contract, and an MCP server that teaches AI assistants to use them.
      </p>
    </header>

    <div class="welcome__panel" role="group" aria-label="Button styles">
      <CabButton class="welcome__key" size="lg">Primary</CabButton>
      <CabButton class="welcome__key" size="lg" variant="secondary">Secondary</CabButton>
      <CabButton class="welcome__key" size="lg" variant="ghost">Ghost</CabButton>
      <CabButton class="welcome__key welcome__replay" size="sm" variant="ghost" @click="powerOn">Power on again</CabButton>
    </div>

    <section aria-labelledby="inside" class="welcome__inside">
      <h2 id="inside" class="welcome__h2">What's inside</h2>
      <div class="welcome__grid">
        <CabCard v-for="[name, blurb] in components" :key="name" :title="name" :heading-level="3">
          <p>{{ blurb }}</p>
        </CabCard>
      </div>
    </section>
  </main>
</template>

<style>
.welcome {
  max-width: 960px; margin: 0 auto; padding: var(--cab-space-8) var(--cab-space-4);
  font-family: var(--cab-font-family-body); color: var(--cab-color-text-default);
}
.welcome__title {
  margin: 0; font-family: var(--cab-font-family-display); font-weight: var(--cab-font-weight-heavy);
  font-size: clamp(3rem, 8vw, 5.5rem); line-height: 1; letter-spacing: -0.03em;
}
.welcome__lede { max-width: 60ch; margin: var(--cab-space-4) 0 0; font-size: var(--cab-font-size-lg); line-height: 1.5; color: var(--cab-color-text-muted); }
.welcome__panel {
  display: flex; flex-wrap: wrap; align-items: center; gap: var(--cab-space-4);
  margin-block: var(--cab-space-8); padding: var(--cab-space-6);
  border-radius: var(--cab-radius-lg); background: var(--cab-color-bg-sunken);
  box-shadow: inset 0 2px 0 rgb(36 22 63 / 0.06);
}
.welcome__replay { margin-inline-start: auto; }
.welcome__h2 { margin: 0 0 var(--cab-space-5); font-family: var(--cab-font-family-display); font-weight: var(--cab-font-weight-heavy); font-size: var(--cab-font-size-2xl); }
.welcome__grid { display: grid; gap: var(--cab-space-5); grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
</style>
