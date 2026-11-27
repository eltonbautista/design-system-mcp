<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import {
  CabButton,
  CabCard,
  CabCheckbox,
  CabDialog,
  CabSelect,
  CabSwitch,
  CabTextField,
} from '@eltonbautista/vue'
import type { CabSelectOption } from '@eltonbautista/vue'

const tracks = [
  {
    title: 'Board games',
    href: '/tracks/board',
    summary: 'Rules, components and playtesting for tabletop games.',
  },
  {
    title: 'Digital',
    href: '/tracks/digital',
    summary: 'Core loops, controls and feedback for screen-based games.',
  },
  {
    title: 'Live-action',
    href: '/tracks/larp',
    summary: 'Roles, scenes and rulesets for games played in person.',
  },
]

const experienceOptions: CabSelectOption[] = [
  { value: 'new', label: 'New to game design' },
  { value: 'some', label: 'Have made a few prototypes' },
  { value: 'experienced', label: 'Design games regularly' },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const form = reactive({
  name: '',
  email: '',
  experience: null as string | null,
  conductAccepted: false,
})

const errors = reactive({ name: '', email: '', experience: '' })

const formRef = ref<HTMLFormElement | null>(null)
const dialogOpen = ref(false)
const booking = ref(false)
const bookingError = ref('')
const booked = ref(false)
const bookedHeading = ref<HTMLElement | null>(null)

function validate(): boolean {
  errors.name = form.name.trim() ? '' : 'Enter your name.'
  errors.email = !form.email.trim()
    ? 'Enter your email address.'
    : EMAIL_PATTERN.test(form.email.trim())
      ? ''
      : 'Enter an email address like name@example.com.'
  errors.experience = form.experience ? '' : 'Choose your experience level.'
  return !errors.name && !errors.email && !errors.experience
}

function onSubmit() {
  if (!form.conductAccepted) return
  if (!validate()) {
    // Move focus to the first invalid field so keyboard and screen reader users land on the problem.
    formRef.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  bookingError.value = ''
  dialogOpen.value = true
}

// Placeholder for the real booking endpoint. Nothing is booked until the user confirms in the dialog.
async function submitBooking(payload: { name: string; email: string; experience: string }) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return payload
}

async function confirmBooking() {
  if (!form.experience) return
  booking.value = true
  bookingError.value = ''
  try {
    await submitBooking({
      name: form.name.trim(),
      email: form.email.trim(),
      experience: form.experience,
    })
    booked.value = true
    dialogOpen.value = false
    await nextTick()
    bookedHeading.value?.focus()
  } catch {
    bookingError.value = 'We could not make your booking. Please try again.'
  } finally {
    booking.value = false
  }
}

// Reminder preference: saved immediately on change, no save button.
const REMINDER_KEY = 'workshop-email-reminders'
const reminders = ref(readReminders())
const reminderStatus = ref('')

function readReminders(): boolean {
  try {
    return localStorage.getItem(REMINDER_KEY) === 'on'
  } catch {
    return false
  }
}

async function saveReminders(value: boolean) {
  localStorage.setItem(REMINDER_KEY, value ? 'on' : 'off')
}

async function onRemindersChange(value: boolean) {
  const previous = reminders.value
  reminders.value = value
  reminderStatus.value = 'Saving…'
  try {
    await saveReminders(value)
    reminderStatus.value = value ? 'Email reminders are on.' : 'Email reminders are off.'
  } catch {
    reminders.value = previous
    reminderStatus.value = 'We could not save that setting. Please try again.'
  }
}
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>

  <div class="page">
    <header class="intro">
      <p class="eyebrow">Weekend workshop</p>
      <h1>Weekend game design workshop</h1>
      <p>
        Two days of hands-on making. Pick a track, learn the craft with other designers,
        and leave with a playable prototype. No experience needed.
      </p>
    </header>

    <main id="main" tabindex="-1">
      <section class="block" aria-labelledby="tracks-heading">
        <h2 id="tracks-heading">Choose a track</h2>
        <ul class="tracks">
          <li v-for="track in tracks" :key="track.href">
            <CabCard as="article" :title="track.title" :href="track.href" :heading-level="3">
              <p>{{ track.summary }}</p>
            </CabCard>
          </li>
        </ul>
      </section>

      <section class="block" aria-labelledby="signup-heading">
        <h2 id="signup-heading">Sign up</h2>

        <div v-if="booked" class="panel">
          <h3 ref="bookedHeading" tabindex="-1">You're booked</h3>
          <p>
            Thanks, {{ form.name.trim() }}. Your seat is reserved. We will send the details to
            {{ form.email.trim() }}.
          </p>
        </div>

        <form v-else ref="formRef" class="signup" novalidate @submit.prevent="onSubmit">
          <CabTextField
            v-model="form.name"
            label="Name"
            autocomplete="name"
            required
            :error="errors.name || undefined"
          />

          <CabTextField
            v-model="form.email"
            label="Email"
            type="email"
            autocomplete="email"
            hint="We only use this for workshop updates."
            required
            :error="errors.email || undefined"
          />

          <CabSelect
            v-model="form.experience"
            label="Experience level"
            :options="experienceOptions"
            placeholder="Choose one"
            :error="errors.experience || undefined"
          />

          <CabCheckbox
            v-model="form.conductAccepted"
            label="I agree to the code of conduct"
            hint="Read the code of conduct on the workshop site before you agree."
          />

          <div class="actions">
            <p id="submit-hint" class="hint">
              <span v-if="!form.conductAccepted">Accept the code of conduct to continue.</span>
            </p>
            <CabButton
              type="submit"
              :disabled="!form.conductAccepted"
              aria-describedby="submit-hint"
            >
              Review and book
            </CabButton>
          </div>
        </form>
      </section>

      <section class="block" aria-labelledby="reminders-heading">
        <h2 id="reminders-heading">Email reminders</h2>
        <CabSwitch
          :model-value="reminders"
          label="Email reminders"
          @update:model-value="onRemindersChange"
        />
        <p class="status" role="status">{{ reminderStatus }}</p>
      </section>
    </main>

    <CabDialog
      v-model:open="dialogOpen"
      title="Confirm your booking"
      description="Check your details. Your seat is not booked until you confirm."
    >
      <dl class="summary">
        <dt>Name</dt>
        <dd>{{ form.name.trim() }}</dd>
        <dt>Email</dt>
        <dd>{{ form.email.trim() }}</dd>
        <dt>Experience</dt>
        <dd>{{ experienceOptions.find((o) => o.value === form.experience)?.label }}</dd>
      </dl>
      <p v-if="bookingError" class="error" role="alert">{{ bookingError }}</p>

      <template #footer>
        <CabButton variant="secondary" :disabled="booking" @click="dialogOpen = false">
          Cancel
        </CabButton>
        <CabButton :loading="booking" @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </div>
</template>

<style scoped>
.page {
  box-sizing: border-box;
  max-width: 56rem;
  margin: 0 auto;
  padding: var(--cab-space-6) var(--cab-space-4);
  color: var(--cab-color-text-default);
  font-family: var(--cab-font-family-body);
  font-size: var(--cab-font-size-md);
}

.skip-link {
  position: absolute;
  left: var(--cab-space-4);
  top: var(--cab-space-2);
  z-index: 10;
  padding: var(--cab-space-2) var(--cab-space-3);
  transform: translateY(-200%);
  background: var(--cab-color-bg-surface);
  color: var(--cab-color-text-default);
  border-radius: var(--cab-radius-md);
  text-decoration: underline;
}

.skip-link:focus-visible {
  transform: translateY(0);
  outline: 3px solid var(--cab-color-focus-ring);
  outline-offset: 2px;
}

main:focus {
  outline: none;
}

.intro h1 {
  margin: var(--cab-space-2) 0 var(--cab-space-3);
  font-family: var(--cab-font-family-display);
  font-size: var(--cab-font-size-2xl);
  font-weight: var(--cab-font-weight-heavy);
}

.intro p {
  max-width: 40rem;
  margin: 0;
}

.eyebrow {
  font-weight: var(--cab-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: var(--cab-font-size-sm);
}

.block {
  margin-block: var(--cab-space-7);
}

.block h2 {
  margin: 0 0 var(--cab-space-4);
  font-family: var(--cab-font-family-display);
  font-size: var(--cab-font-size-xl);
  font-weight: var(--cab-font-weight-heavy);
}

.tracks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--cab-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tracks p {
  margin: 0;
}

.signup {
  display: grid;
  gap: var(--cab-space-4);
  max-width: 32rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--cab-space-3);
}

.hint,
.status {
  margin: 0;
  min-height: 1.5em;
}

.panel {
  max-width: 32rem;
  padding: var(--cab-space-4);
  background: var(--cab-color-bg-surface);
  border: 1px solid var(--cab-color-border-default);
  border-radius: var(--cab-radius-lg);
}

.panel h3 {
  margin: 0 0 var(--cab-space-2);
  font-family: var(--cab-font-family-display);
}

.panel h3:focus {
  outline: 3px solid var(--cab-color-focus-ring);
  outline-offset: 2px;
}

.summary {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--cab-space-2) var(--cab-space-4);
  margin: 0 0 var(--cab-space-4);
}

.summary dt {
  font-weight: var(--cab-font-weight-bold);
}

.summary dd {
  margin: 0;
}

.error {
  margin: 0 0 var(--cab-space-4);
  color: var(--cab-color-danger-text);
}
</style>
