<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
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
    blurb: 'Cards, dice and rules that fit on one table.',
  },
  {
    title: 'Digital',
    href: '/tracks/digital',
    blurb: 'Make something playable in a browser by Sunday.',
  },
  {
    title: 'Live-action',
    href: '/tracks/larp',
    blurb: 'Roles, props and rules for a game you play on your feet.',
  },
]

const experienceOptions = [
  { value: 'new', label: 'New to game design' },
  { value: 'some', label: 'Made a game or two' },
  { value: 'experienced', label: 'Published or professional' },
]

// Sign-up form
const name = ref('')
const email = ref('')
const experience = ref<string | null>(null)
const conduct = ref(false)
const errors = ref<{ name?: string; email?: string; experience?: string; conduct?: string }>({})
const errorCount = computed(() => Object.keys(errors.value).length)
const formRef = ref<HTMLFormElement | null>(null)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  const found: typeof errors.value = {}
  if (!name.value.trim()) found.name = 'Enter your name.'
  if (!email.value.trim()) found.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(email.value.trim())) found.email = 'Enter an email address like name@example.com.'
  if (!experience.value) found.experience = 'Choose your experience level.'
  if (!conduct.value) found.conduct = 'Accept the code of conduct to continue.'
  return found
}

function focusFirstError() {
  const form = formRef.value
  if (!form) return
  const target =
    form.querySelector<HTMLElement>('[aria-invalid="true"]') ??
    form.querySelector<HTMLElement>('input[type="checkbox"]')
  target?.focus()
}

// Booking confirmation
const confirmOpen = ref(false)
const bookingStatus = ref('')
const experienceLabel = computed(
  () => experienceOptions.find((o) => o.value === experience.value)?.label ?? '',
)

async function onSubmit() {
  bookingStatus.value = ''
  errors.value = validate()
  if (errorCount.value > 0) {
    await nextTick()
    focusFirstError()
    return
  }
  confirmOpen.value = true
}

function confirmBooking() {
  // No booking API exists in this project yet: this only updates the page.
  const firstName = name.value.trim()
  bookingStatus.value = `You're booked, ${firstName}. Thanks for signing up.`
  name.value = ''
  email.value = ''
  experience.value = null
  conduct.value = false
  errors.value = {}
  confirmOpen.value = false
}

// Email reminders: saved immediately on change
const REMINDER_KEY = 'workshop-email-reminders'

function loadReminders(): boolean {
  try {
    return localStorage.getItem(REMINDER_KEY) === 'on'
  } catch {
    return false
  }
}

const reminders = ref(loadReminders())
const reminderStatus = ref('')

watch(reminders, (on) => {
  try {
    localStorage.setItem(REMINDER_KEY, on ? 'on' : 'off')
    reminderStatus.value = on ? 'Email reminders are on. Saved.' : 'Email reminders are off. Saved.'
  } catch {
    reminderStatus.value = "Couldn't save your setting. Try again."
  }
})
</script>

<template>
  <main>
    <header>
      <h1>Weekend game design workshop</h1>
      <p class="intro">
        Two days of making games. Pick a track, sign up for a place, and turn on reminders so
        you don't miss the start.
      </p>
    </header>

    <section aria-labelledby="tracks-heading">
      <h2 id="tracks-heading">Choose a track</h2>
      <div class="tracks">
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

    <section aria-labelledby="signup-heading">
      <h2 id="signup-heading">Sign up</h2>

      <p v-if="errorCount > 0" class="error-summary" role="alert">
        Fix the {{ errorCount }} {{ errorCount === 1 ? 'problem' : 'problems' }} below to continue.
      </p>

      <form ref="formRef" class="signup" novalidate @submit.prevent="onSubmit">
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
          hint="We'll use this for your booking and reminders."
          required
          :error="errors.email"
        />

        <CabSelect
          v-model="experience"
          label="Experience level"
          :options="experienceOptions"
          placeholder="Select…"
          :error="errors.experience"
        />

        <div class="conduct">
          <CabCheckbox
            v-model="conduct"
            label="I agree to the code of conduct"
            hint="Required to book a place."
          />
          <p v-if="errors.conduct" class="error">{{ errors.conduct }}</p>
        </div>

        <div>
          <CabButton type="submit">Book my place</CabButton>
        </div>
      </form>

      <p class="status" role="status">{{ bookingStatus }}</p>
    </section>

    <section aria-labelledby="reminders-heading">
      <h2 id="reminders-heading">Email reminders</h2>
      <p class="hint">
        Get an email before the workshop starts. Your choice is saved as soon as you change it.
      </p>
      <CabSwitch v-model="reminders" label="Email reminders" />
      <p class="status" role="status">{{ reminderStatus }}</p>
    </section>

    <CabDialog
      v-model:open="confirmOpen"
      title="Confirm your booking?"
      description="Check your details. Nothing is booked until you confirm."
    >
      <dl class="summary">
        <dt>Name</dt>
        <dd>{{ name }}</dd>
        <dt>Email</dt>
        <dd>{{ email }}</dd>
        <dt>Experience level</dt>
        <dd>{{ experienceLabel }}</dd>
      </dl>
      <template #footer>
        <CabButton variant="ghost" @click="confirmOpen = false">Go back</CabButton>
        <CabButton @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </main>
</template>

<style scoped>
main {
  max-width: 760px;
  margin-inline: auto;
  padding: var(--cab-space-7) var(--cab-space-5);
  font-family: var(--cab-font-family-body);
  font-size: var(--cab-font-size-md);
  color: var(--cab-color-text-default);
}

h1,
h2 {
  font-family: var(--cab-font-family-display);
  font-weight: var(--cab-font-weight-heavy);
  color: var(--cab-color-text-default);
  margin: 0;
}

h1 {
  font-size: var(--cab-font-size-2xl);
  margin-block-end: var(--cab-space-3);
}

h2 {
  font-size: var(--cab-font-size-xl);
  margin-block-end: var(--cab-space-5);
}

section {
  margin-block-start: var(--cab-space-8);
}

.intro {
  font-size: var(--cab-font-size-lg);
  color: var(--cab-color-text-muted);
  margin: 0;
}

.hint {
  color: var(--cab-color-text-muted);
  margin-block: 0 var(--cab-space-4);
}

.tracks {
  display: grid;
  gap: var(--cab-space-5);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.signup {
  display: grid;
  gap: var(--cab-space-5);
  max-width: 480px;
}

.conduct {
  display: grid;
  gap: var(--cab-space-2);
}

.error,
.error-summary {
  color: var(--cab-color-danger-text);
  font-size: var(--cab-font-size-sm);
  font-weight: var(--cab-font-weight-medium);
  margin: 0;
}

.error-summary {
  max-width: 480px;
  margin-block-end: var(--cab-space-4);
  font-size: var(--cab-font-size-md);
}

.status {
  min-height: 1.5em;
  margin-block-start: var(--cab-space-4);
  font-weight: var(--cab-font-weight-medium);
}

.summary {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--cab-space-2) var(--cab-space-4);
  margin: 0;
}

.summary dt {
  font-weight: var(--cab-font-weight-bold);
}

.summary dd {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
