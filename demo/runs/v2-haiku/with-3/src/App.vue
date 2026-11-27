<script setup lang="ts">
import { nextTick, ref, computed } from 'vue'
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
    description: 'Cards, boards and rules that play well on one table.',
    href: '/tracks/board',
  },
  {
    title: 'Digital',
    description: 'Make something playable in a browser by Sunday.',
    href: '/tracks/digital',
  },
  {
    title: 'Live-action',
    description: 'Design roles, scenes and rules for players who move and talk.',
    href: '/tracks/larp',
  },
]

const levelOptions = [
  { value: 'new', label: 'New to game design' },
  { value: 'some', label: 'Made a few prototypes' },
  { value: 'experienced', label: 'Have run or published games' },
]

type FieldErrors = Partial<Record<'name' | 'email' | 'level' | 'conduct', string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Sign-up form state
const formEl = ref<HTMLFormElement | null>(null)
const name = ref('')
const email = ref('')
const level = ref<string | null>(null)
const conduct = ref(false)
const errors = ref<FieldErrors>({})

// Booking confirmation state
const confirmOpen = ref(false)
const booking = ref(false)
const bookingError = ref('')
const bookingStatus = ref('')

const levelLabel = computed(
  () => levelOptions.find((option) => option.value === level.value)?.label ?? '',
)

// Email reminders: saved immediately on each change
const REMINDERS_KEY = 'workshop-email-reminders'

function readReminders(): boolean {
  try {
    return localStorage.getItem(REMINDERS_KEY) === 'on'
  } catch {
    return false
  }
}

const remindersOn = ref(readReminders())
const reminderStatus = ref('')

function setReminders(on: boolean) {
  remindersOn.value = on
  try {
    localStorage.setItem(REMINDERS_KEY, on ? 'on' : 'off')
    reminderStatus.value = on ? 'Email reminders are on.' : 'Email reminders are off.'
  } catch {
    reminderStatus.value = 'Could not save your reminder setting on this device.'
  }
}

function validate(): FieldErrors {
  const found: FieldErrors = {}
  if (!name.value.trim()) {
    found.name = 'Enter your name.'
  }
  if (!email.value.trim()) {
    found.email = 'Enter your email address.'
  } else if (!EMAIL_PATTERN.test(email.value.trim())) {
    found.email = 'Enter an email address in the form name@example.com.'
  }
  if (!level.value) {
    found.level = 'Choose your experience level.'
  }
  if (!conduct.value) {
    found.conduct = 'You must accept the code of conduct before you can book.'
  }
  return found
}

function focusFirstInvalid() {
  const form = formEl.value
  if (!form) return
  const target =
    form.querySelector<HTMLElement>('[aria-invalid="true"]') ??
    form.querySelector<HTMLElement>('input[type="checkbox"]')
  target?.focus()
}

function onSubmit() {
  errors.value = validate()
  if (Object.keys(errors.value).length > 0) {
    nextTick(focusFirstInvalid)
    return
  }
  bookingError.value = ''
  confirmOpen.value = true
}

// Placeholder for the real booking request. This project has no backend yet,
// so this resolves immediately; replace the body with the API call.
interface BookingRequest {
  name: string
  email: string
  experience: string
  codeOfConductAccepted: boolean
}

async function createBooking(_request: BookingRequest): Promise<void> {
  // TODO: POST the booking to the workshop API.
}

async function confirmBooking() {
  booking.value = true
  bookingError.value = ''
  try {
    await createBooking({
      name: name.value.trim(),
      email: email.value.trim(),
      experience: level.value ?? '',
      codeOfConductAccepted: conduct.value,
    })
    confirmOpen.value = false
    bookingStatus.value = `Your place is booked, ${name.value.trim()}. Confirmation will go to ${email.value.trim()}.`
    name.value = ''
    email.value = ''
    level.value = null
    conduct.value = false
    errors.value = {}
  } catch {
    bookingError.value = 'The booking could not be made. Please try again.'
  } finally {
    booking.value = false
  }
}
</script>

<template>
  <main class="page">
    <header class="intro">
      <h1>Weekend game design workshop</h1>
      <p>
        Two days of designing, prototyping and playtesting games with other makers.
        Pick a track, then sign up below.
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
        >
          <p>{{ track.description }}</p>
        </CabCard>
      </div>
    </section>

    <section aria-labelledby="signup-heading">
      <h2 id="signup-heading">Sign up</h2>
      <p class="muted">Fields marked required must be completed before you can book.</p>

      <form ref="formEl" class="form" novalidate @submit.prevent="onSubmit">
        <CabTextField
          v-model="name"
          label="Name (required)"
          autocomplete="name"
          required
          :error="errors.name"
        />
        <CabTextField
          v-model="email"
          type="email"
          label="Email (required)"
          autocomplete="email"
          required
          hint="Booking confirmations are sent here."
          :error="errors.email"
        />
        <CabSelect
          v-model="level"
          label="Experience level (required)"
          :options="levelOptions"
          placeholder="Choose a level"
          hint="Pick the option closest to you."
          :error="errors.level"
        />
        <div class="conduct">
          <CabCheckbox
            v-model="conduct"
            label="I accept the code of conduct (required)"
            hint="Treat everyone with respect, ask before touching or pushing anyone's limits, and stop when asked."
          />
          <p v-if="errors.conduct" class="error" role="alert">{{ errors.conduct }}</p>
        </div>
        <div class="actions">
          <CabButton type="submit">Review booking</CabButton>
        </div>
      </form>

      <p role="status" class="status">{{ bookingStatus }}</p>
    </section>

    <section aria-labelledby="reminders-heading">
      <h2 id="reminders-heading">Email reminders</h2>
      <p class="muted">
        Get an email reminder before each session. The setting is saved as soon as you change it.
      </p>
      <CabSwitch
        :model-value="remindersOn"
        label="Email reminders"
        @update:model-value="setReminders"
      />
      <p role="status" class="status">{{ reminderStatus }}</p>
    </section>

    <CabDialog
      v-model:open="confirmOpen"
      title="Confirm your booking"
      description="Check your details. Nothing is booked until you confirm."
    >
      <dl class="summary">
        <dt>Name</dt>
        <dd>{{ name.trim() }}</dd>
        <dt>Email</dt>
        <dd>{{ email.trim() }}</dd>
        <dt>Experience</dt>
        <dd>{{ levelLabel }}</dd>
        <dt>Code of conduct</dt>
        <dd>Accepted</dd>
      </dl>
      <p v-if="bookingError" class="error" role="alert">{{ bookingError }}</p>
      <template #footer>
        <CabButton variant="ghost" :disabled="booking" @click="confirmOpen = false">
          Edit details
        </CabButton>
        <CabButton :loading="booking" @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </main>
</template>

<style scoped>
.page {
  max-width: 760px;
  margin-inline: auto;
  padding: var(--cab-space-7) var(--cab-space-5);
  display: grid;
  gap: var(--cab-space-7);
  color: var(--cab-color-text-default);
}

.intro p,
.muted {
  color: var(--cab-color-text-muted);
}

.tracks {
  display: grid;
  gap: var(--cab-space-5);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.form {
  display: grid;
  gap: var(--cab-space-5);
  max-width: 480px;
}

.conduct {
  display: grid;
  gap: var(--cab-space-2);
}

.error {
  margin: 0;
  color: var(--cab-color-danger-text);
  font-weight: var(--cab-font-weight-bold);
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.status:empty {
  display: none;
}

.summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--cab-space-2) var(--cab-space-4);
  margin: 0;
}

.summary dt {
  font-weight: var(--cab-font-weight-bold);
}

.summary dd {
  margin: 0;
}
</style>
