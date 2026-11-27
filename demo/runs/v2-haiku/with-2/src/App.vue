<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
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
  {
    title: 'Board games',
    href: '/tracks/board',
    blurb: 'Cards, dice and rules that fit on one page.',
  },
  {
    title: 'Digital',
    href: '/tracks/digital',
    blurb: 'Make something playable in a browser by Sunday.',
  },
  {
    title: 'Live-action',
    href: '/tracks/larp',
    blurb: 'Write roles, scenes and props for players to act out.',
  },
]

const experienceOptions = [
  { value: 'new', label: 'New to game design' },
  { value: 'some', label: 'Some experience' },
  { value: 'experienced', label: 'Experienced designer' },
]

// Email reminders: a setting that applies immediately, so it saves on every change.
const REMINDERS_KEY = 'workshop-email-reminders'
const reminders = ref(localStorage.getItem(REMINDERS_KEY) === 'on')
const reminderStatus = ref('')

watch(reminders, (on) => {
  localStorage.setItem(REMINDERS_KEY, on ? 'on' : 'off')
  reminderStatus.value = on
    ? 'Email reminders are on. Saved.'
    : 'Email reminders are off. Saved.'
})

// Sign-up form
const form = reactive({
  name: '',
  email: '',
  experience: null as string | null,
  conduct: false,
})
const errors = reactive({
  name: '',
  email: '',
  experience: '',
  conduct: '',
})
const errorSummary = ref<HTMLElement | null>(null)
const summaryMessages = ref<string[]>([])
const bookingOpen = ref(false)
const bookingStatus = ref('')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(): boolean {
  errors.name = form.name.trim() ? '' : 'Enter your name.'
  errors.email = EMAIL_PATTERN.test(form.email.trim())
    ? ''
    : 'Enter an email address like name@example.com.'
  errors.experience = form.experience ? '' : 'Choose your experience level.'
  errors.conduct = form.conduct ? '' : 'Accept the code of conduct to sign up.'

  summaryMessages.value = Object.values(errors).filter(Boolean)
  return summaryMessages.value.length === 0
}

function onSubmit() {
  bookingStatus.value = ''
  if (!validate()) {
    // Move focus to the error summary so keyboard and screen reader users hear what to fix.
    nextTick(() => errorSummary.value?.focus())
    return
  }
  bookingOpen.value = true
}

function confirmBooking() {
  const name = form.name.trim()
  bookingOpen.value = false
  bookingStatus.value = `Seat booked for ${name}.`
  form.name = ''
  form.email = ''
  form.experience = null
  form.conduct = false
  summaryMessages.value = []
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })
}

const selectedExperience = () =>
  experienceOptions.find((o) => o.value === form.experience)?.label ?? ''
</script>

<template>
  <main class="page">
    <header class="intro">
      <h1>Weekend game design workshop</h1>
      <p>
        Two days of making games with other designers. Pick a track, then sign up for
        a seat. Board games, digital games and live-action games are all welcome, and
        no prior experience is needed.
      </p>
    </header>

    <section class="section" aria-labelledby="tracks-heading">
      <h2 id="tracks-heading">Choose a track</h2>
      <div class="track-grid">
        <CabCard
          v-for="track in tracks"
          :key="track.href"
          :title="track.title"
          :href="track.href"
          :heading-level="3"
        >
          <p>{{ track.blurb }}</p>
        </CabCard>
      </div>
    </section>

    <section class="section" aria-labelledby="signup-heading">
      <h2 id="signup-heading">Sign up</h2>

      <form class="signup" novalidate @submit.prevent="onSubmit">
        <div
          v-if="summaryMessages.length"
          ref="errorSummary"
          class="error-summary"
          tabindex="-1"
        >
          <p class="error-summary__title">Please fix {{ summaryMessages.length === 1 ? 'this' : 'these' }} before continuing:</p>
          <ul>
            <li v-for="message in summaryMessages" :key="message">{{ message }}</li>
          </ul>
        </div>

        <CabTextField
          v-model="form.name"
          label="Name"
          autocomplete="name"
          required
          :error="errors.name"
        />

        <CabTextField
          v-model="form.email"
          label="Email"
          type="email"
          autocomplete="email"
          required
          hint="We only use it to send your booking details."
          :error="errors.email"
        />

        <CabSelect
          v-model="form.experience"
          label="Experience level"
          :options="experienceOptions"
          placeholder="Choose one"
          :error="errors.experience"
        />

        <CabCheckbox
          v-model="form.conduct"
          label="I accept the code of conduct"
          :hint="errors.conduct || 'Required to sign up.'"
        />

        <div class="actions">
          <CabButton type="submit">Sign up</CabButton>
        </div>
      </form>

      <p v-if="bookingStatus" class="status" role="status">{{ bookingStatus }}</p>
    </section>

    <section class="section" aria-labelledby="reminders-heading">
      <h2 id="reminders-heading">Reminders</h2>
      <CabSwitch v-model="reminders" label="Email reminders" />
      <p class="status" role="status" aria-live="polite">{{ reminderStatus }}</p>
    </section>

    <CabDialog
      v-model:open="bookingOpen"
      title="Confirm your booking"
      description="Check your details. Your seat is not booked until you confirm."
    >
      <dl class="summary">
        <dt>Name</dt>
        <dd>{{ form.name.trim() }}</dd>
        <dt>Email</dt>
        <dd>{{ form.email.trim() }}</dd>
        <dt>Experience</dt>
        <dd>{{ selectedExperience() }}</dd>
      </dl>
      <template #footer>
        <CabButton variant="ghost" @click="bookingOpen = false">Go back</CabButton>
        <CabButton @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </main>
</template>

<style scoped>
.page {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--cab-space-7) var(--cab-space-5);
  color: var(--cab-color-text-default);
  font-family: var(--cab-font-family-body);
  font-size: var(--cab-font-size-md);
  display: grid;
  gap: var(--cab-space-8);
}

h1,
h2 {
  font-family: var(--cab-font-family-display);
  color: var(--cab-color-text-default);
  margin: 0;
}

h1 {
  font-size: var(--cab-font-size-2xl);
  font-weight: var(--cab-font-weight-heavy);
}

h2 {
  font-size: var(--cab-font-size-xl);
  font-weight: var(--cab-font-weight-bold);
  margin-bottom: var(--cab-space-4);
}

.intro p {
  margin: var(--cab-space-3) 0 0;
  color: var(--cab-color-text-muted);
}

.section {
  display: block;
}

.track-grid {
  display: grid;
  gap: var(--cab-space-5);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.track-grid p {
  margin: 0;
  color: var(--cab-color-text-muted);
}

.signup {
  display: grid;
  gap: var(--cab-space-5);
  max-width: 420px;
}

.actions {
  display: flex;
  gap: var(--cab-space-3);
}

.error-summary {
  border: 2px solid var(--cab-color-danger-text);
  border-radius: var(--cab-radius-md);
  background: var(--cab-color-bg-surface);
  padding: var(--cab-space-4);
  color: var(--cab-color-danger-text);
}

.error-summary:focus-visible {
  outline: 3px solid var(--cab-color-focus-ring);
  outline-offset: 3px;
}

.error-summary__title {
  margin: 0 0 var(--cab-space-2);
  font-weight: var(--cab-font-weight-bold);
}

.error-summary ul {
  margin: 0;
  padding-left: var(--cab-space-5);
}

.status {
  margin: var(--cab-space-4) 0 0;
  color: var(--cab-color-text-default);
  font-weight: var(--cab-font-weight-medium);
}

.summary {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--cab-space-2) var(--cab-space-4);
  margin: 0;
}

.summary dt {
  color: var(--cab-color-text-muted);
}

.summary dd {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
