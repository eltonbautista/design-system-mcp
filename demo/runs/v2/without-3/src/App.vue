<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import {
  CabButton,
  CabCard,
  CabCheckbox,
  CabDialog,
  CabSelect,
  CabSwitch,
  CabTextField,
} from '@eltonbautista/vue'

const tracks = [
  { title: 'Board games', href: '/tracks/board', blurb: 'Prototype with cards, dice and cardboard. Playtest by lunchtime.' },
  { title: 'Digital', href: '/tracks/digital', blurb: 'Build a small playable game on screen, from first sketch to first level.' },
  { title: 'Live-action', href: '/tracks/larp', blurb: 'Design a story people play out in person, with rules for roles and scenes.' },
]

const levels = [
  { value: 'beginner', label: 'Beginner: new to game design' },
  { value: 'intermediate', label: 'Intermediate: I have made a game or two' },
  { value: 'advanced', label: 'Advanced: I design games regularly' },
]

const form = ref<HTMLFormElement | null>(null)
const name = ref('')
const email = ref('')
const level = ref<string | null>(null)
const conduct = ref(false)
const errors = ref<{ name?: string; email?: string; level?: string; conduct?: string }>({})

const confirmOpen = ref(false)
const booked = ref(false)
const bookedHeading = ref<HTMLElement | null>(null)

// Email reminders: saved immediately on every change, no save button.
const REMINDER_KEY = 'workshop:email-reminders'
const reminders = ref(localStorage.getItem(REMINDER_KEY) === 'true')
const reminderStatus = ref('')
watch(reminders, (on) => {
  localStorage.setItem(REMINDER_KEY, String(on))
  reminderStatus.value = on ? 'Email reminders turned on. Saved.' : 'Email reminders turned off. Saved.'
})

function validate() {
  const e: typeof errors.value = {}
  if (!name.value.trim()) e.name = 'Enter your name.'
  if (!email.value.trim()) e.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) e.email = 'Enter an email address like name@example.com.'
  if (!level.value) e.level = 'Choose your experience level.'
  if (!conduct.value) e.conduct = 'You must accept the code of conduct to sign up.'
  errors.value = e
  return Object.keys(e).length === 0
}

async function onSubmit() {
  if (validate()) {
    confirmOpen.value = true
    return
  }
  await nextTick()
  // Move focus to the first field with a problem.
  const target = form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')
    ?? (errors.value.conduct ? form.value?.querySelector<HTMLElement>('input[type="checkbox"]') : null)
  target?.focus()
}

async function confirmBooking() {
  confirmOpen.value = false
  booked.value = true
  await nextTick()
  bookedHeading.value?.focus()
}
</script>

<template>
  <a class="skip-link" href="#main">Skip to main content</a>
  <main id="main" class="page">
    <header class="hero">
      <h1>Weekend Game-Design Workshop</h1>
      <p class="intro">
        Two days of making, playing and breaking games with other designers. Pick a track, bring your
        curiosity, and leave with a game you can share. No experience needed.
      </p>
    </header>

    <section aria-labelledby="tracks-heading" class="section">
      <h2 id="tracks-heading">Choose your track</h2>
      <ul class="tracks">
        <li v-for="t in tracks" :key="t.href">
          <CabCard :title="t.title" :href="t.href" :heading-level="3" as="div">
            <p>{{ t.blurb }}</p>
          </CabCard>
        </li>
      </ul>
    </section>

    <section aria-labelledby="signup-heading" class="section">
      <h2 id="signup-heading">Sign up</h2>

      <div v-if="booked" class="success" role="status">
        <h3 ref="bookedHeading" tabindex="-1">You're booked in!</h3>
        <p>Thanks, {{ name }}. We've saved your seat and will email {{ email }} with the details.</p>
      </div>

      <form v-else ref="form" class="form" novalidate @submit.prevent="onSubmit">
        <p class="note">All fields are required.</p>
        <CabTextField
          v-model="name"
          label="Name"
          autocomplete="name"
          required
          :error="errors.name"
        />
        <CabTextField
          v-model="email"
          label="Email"
          type="email"
          autocomplete="email"
          required
          :error="errors.email"
        />
        <CabSelect
          v-model="level"
          label="Experience level"
          placeholder="Choose a level"
          :options="levels"
          :error="errors.level"
        />
        <div>
          <CabCheckbox
            v-model="conduct"
            label="I accept the code of conduct"
            hint="Be kind, respect others' boundaries and play fair."
          />
          <p v-if="errors.conduct" class="field-error" role="alert">{{ errors.conduct }}</p>
        </div>
        <div>
          <CabButton type="submit">Sign up</CabButton>
        </div>
      </form>
    </section>

    <section aria-labelledby="prefs-heading" class="section">
      <h2 id="prefs-heading">Preferences</h2>
      <CabSwitch v-model="reminders" label="Email reminders" />
      <p class="note" role="status">{{ reminderStatus }}</p>
    </section>

    <CabDialog
      v-model:open="confirmOpen"
      title="Confirm your booking"
      description="Please check your details before we book your seat."
    >
      <dl class="summary">
        <dt>Name</dt>
        <dd>{{ name }}</dd>
        <dt>Email</dt>
        <dd>{{ email }}</dd>
        <dt>Experience</dt>
        <dd>{{ levels.find((l) => l.value === level)?.label }}</dd>
      </dl>
      <template #footer>
        <CabButton variant="secondary" @click="confirmOpen = false">Go back</CabButton>
        <CabButton @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </main>
</template>

<style>
body {
  margin: 0;
  background: var(--cab-color-bg, #fff);
  color: var(--cab-color-text, #111);
  font-family: 'Outfit', system-ui, sans-serif;
}
.skip-link {
  position: absolute;
  left: 0.5rem;
  top: -4rem;
  padding: 0.5rem 1rem;
  background: #fff;
  color: #000;
  border: 2px solid currentColor;
  z-index: 10;
}
.skip-link:focus {
  top: 0.5rem;
}
.page {
  max-width: 60rem;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
}
h1, h2, h3 {
  font-family: 'Sora', system-ui, sans-serif;
}
.intro {
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 40rem;
}
.section {
  margin-top: 3rem;
}
.tracks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}
.form {
  display: grid;
  gap: 1.25rem;
  max-width: 28rem;
}
.note {
  margin: 0.5rem 0;
  min-height: 1.5em;
}
.field-error {
  margin: 0.25rem 0 0;
  color: #b00020;
  font-weight: 600;
}
.success {
  max-width: 28rem;
  padding: 1rem 1.5rem;
  border: 2px solid currentColor;
  border-radius: 0.5rem;
}
.summary dt {
  font-weight: 600;
}
.summary dd {
  margin: 0 0 0.75rem;
}
</style>
