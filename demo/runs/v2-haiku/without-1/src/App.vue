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
import type { CabSelectOption } from '@eltonbautista/vue'

const tracks = [
  {
    title: 'Board games',
    href: '/tracks/board',
    description: 'Design a tabletop game from rules to playtest, using paper prototypes and plenty of cards and dice.',
  },
  {
    title: 'Digital',
    href: '/tracks/digital',
    description: 'Build a small playable game for screen, focusing on core loops, feedback and controls.',
  },
  {
    title: 'Live-action',
    href: '/tracks/larp',
    description: 'Write and run a live-action game with roles, props and scenes played out in person.',
  },
]

const experienceOptions: CabSelectOption[] = [
  { value: 'new', label: 'New to game design' },
  { value: 'some', label: 'Some experience' },
  { value: 'experienced', label: 'Experienced designer' },
]

type FieldKey = 'name' | 'email' | 'experience' | 'conduct'
type FormErrors = Partial<Record<FieldKey, string>>

// Order matters: it drives the error summary and which field gets focus first.
const FIELD_ORDER: FieldKey[] = ['name', 'email', 'experience', 'conduct']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const name = ref('')
const email = ref('')
const experience = ref<string | null>(null)
const conductAccepted = ref(false)

const errors = ref<FormErrors>({})
const hasSubmitted = ref(false)
const formEl = ref<HTMLFormElement | null>(null)

const errorList = computed(() =>
  FIELD_ORDER.flatMap((key) => {
    const message = errors.value[key]
    return message ? [{ key, message }] : []
  }),
)

function validate(): FormErrors {
  const next: FormErrors = {}
  if (!name.value.trim()) next.name = 'Enter your name.'
  if (!email.value.trim()) next.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(email.value.trim())) next.email = 'Enter an email address like name@example.com.'
  if (!experience.value) next.experience = 'Choose your experience level.'
  if (!conductAccepted.value) next.conduct = 'Accept the code of conduct to continue.'
  errors.value = next
  return next
}

// After a failed submit, keep errors in step with the fields as the user fixes them.
watch([name, email, experience, conductAccepted], () => {
  if (hasSubmitted.value) validate()
})

function focusField(key: FieldKey) {
  formEl.value
    ?.querySelector<HTMLElement>(
      `[data-field="${key}"] input, [data-field="${key}"] select, [data-field="${key}"] [role="combobox"], [data-field="${key}"] button`,
    )
    ?.focus()
}

const confirmOpen = ref(false)
const booked = ref<string | null>(null)
const bookedHeading = ref<HTMLElement | null>(null)

function onSubmit() {
  hasSubmitted.value = true
  const problems = validate()
  const firstProblem = FIELD_ORDER.find((key) => problems[key])
  if (firstProblem) {
    focusField(firstProblem)
    return
  }
  confirmOpen.value = true
}

const experienceLabel = computed(
  () => experienceOptions.find((option) => option.value === experience.value)?.label ?? '',
)

async function confirmBooking() {
  confirmOpen.value = false
  // No booking API is wired up yet; this records the booking locally.
  booked.value = name.value.trim()
  await nextTick()
  bookedHeading.value?.focus()
}

// Email reminders are saved as soon as the switch changes; there is no save button.
const REMINDER_KEY = 'workshop:email-reminders'

function readReminderPreference(): boolean {
  try {
    return localStorage.getItem(REMINDER_KEY) === 'on'
  } catch {
    return false
  }
}

const remindersOn = ref(readReminderPreference())
const reminderStatus = ref('')

function setReminders(on: boolean) {
  try {
    localStorage.setItem(REMINDER_KEY, on ? 'on' : 'off')
    remindersOn.value = on
    reminderStatus.value = on ? 'Email reminders are on.' : 'Email reminders are off.'
  } catch {
    reminderStatus.value = "Couldn't save that change. Your setting is unchanged."
  }
}
</script>

<template>
  <main class="page">
    <header class="intro">
      <h1>Weekend game design workshop</h1>
      <p>
        Spend a weekend designing, prototyping and playtesting your own game with other designers.
        Pick a track, then sign up for a seat.
      </p>
    </header>

    <section class="section" aria-labelledby="tracks-heading">
      <h2 id="tracks-heading">Choose a track</h2>
      <ul class="tracks">
        <li v-for="track in tracks" :key="track.href">
          <CabCard :title="track.title" :href="track.href" :heading-level="3">
            <p>{{ track.description }}</p>
          </CabCard>
        </li>
      </ul>
    </section>

    <section class="section" aria-labelledby="signup-heading">
      <h2 id="signup-heading">Sign up</h2>

      <div v-if="booked" class="booked">
        <h3 ref="bookedHeading" tabindex="-1">You're booked, {{ booked }}</h3>
        <p>Your seat for the workshop is booked.</p>
      </div>

      <form v-else ref="formEl" class="form" novalidate @submit.prevent="onSubmit">
        <div v-if="errorList.length" class="error-summary" role="alert">
          <p>
            {{ errorList.length === 1 ? 'Fix this problem to continue:' : 'Fix these problems to continue:' }}
          </p>
          <ul>
            <li v-for="item in errorList" :key="item.key">{{ item.message }}</li>
          </ul>
        </div>

        <div data-field="name">
          <CabTextField
            v-model="name"
            label="Name"
            autocomplete="name"
            required
            :error="errors.name"
          />
        </div>

        <div data-field="email">
          <CabTextField
            v-model="email"
            label="Email"
            type="email"
            autocomplete="email"
            required
            :error="errors.email"
          />
        </div>

        <div data-field="experience">
          <CabSelect
            v-model="experience"
            label="Experience level"
            hint="Pick the option closest to you."
            placeholder="Choose one"
            :options="experienceOptions"
            :error="errors.experience"
          />
        </div>

        <div class="conduct" data-field="conduct">
          <p>
            Please read our <a href="/code-of-conduct">code of conduct</a> before you book.
          </p>
          <CabCheckbox
            v-model="conductAccepted"
            label="I have read and accept the code of conduct"
            :hint="errors.conduct"
          />
        </div>

        <div class="actions">
          <CabButton type="submit" variant="primary">Review booking</CabButton>
        </div>
      </form>
    </section>

    <section class="section" aria-labelledby="reminders-heading">
      <h2 id="reminders-heading">Email reminders</h2>
      <p>Get an email reminder before workshop sessions. Your choice is saved as soon as you change it.</p>
      <CabSwitch
        :model-value="remindersOn"
        label="Send me email reminders"
        @update:model-value="setReminders"
      />
      <p class="status" role="status">{{ reminderStatus }}</p>
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
        <dt>Experience level</dt>
        <dd>{{ experienceLabel }}</dd>
      </dl>
      <template #footer>
        <CabButton variant="secondary" @click="confirmOpen = false">Edit details</CabButton>
        <CabButton variant="primary" @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </main>
</template>

<style scoped>
.page {
  box-sizing: border-box;
  max-width: 60rem;
  margin: 0 auto;
  padding: var(--cab-space-6) var(--cab-space-4);
  color: var(--cab-color-text-default);
  font-family: var(--cab-font-family-body);
  font-size: var(--cab-font-size-md);
}

h1,
h2,
h3 {
  font-family: var(--cab-font-family-display);
  line-height: 1.2;
}

h1 {
  margin: 0 0 var(--cab-space-3);
  font-size: var(--cab-font-size-2xl);
  font-weight: var(--cab-font-weight-heavy);
}

h2 {
  margin: 0 0 var(--cab-space-4);
  font-size: var(--cab-font-size-xl);
  font-weight: var(--cab-font-weight-bold);
}

h3 {
  margin: 0 0 var(--cab-space-2);
  font-size: var(--cab-font-size-lg);
  font-weight: var(--cab-font-weight-bold);
}

h3:focus {
  outline: none;
}

p {
  margin: 0 0 var(--cab-space-3);
  color: var(--cab-color-text-muted);
}

.intro p {
  max-width: 40rem;
  font-size: var(--cab-font-size-lg);
}

.section {
  margin-top: var(--cab-space-7);
}

.tracks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--cab-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tracks p {
  margin: 0;
}

.form {
  display: grid;
  gap: var(--cab-space-4);
  max-width: 32rem;
}

.error-summary {
  padding: var(--cab-space-3) var(--cab-space-4);
  border: 2px solid var(--cab-color-danger-text);
  border-radius: var(--cab-radius-md);
  background: var(--cab-color-bg-surface);
  color: var(--cab-color-danger-text);
}

.error-summary p {
  margin: 0 0 var(--cab-space-2);
  color: var(--cab-color-danger-text);
  font-weight: var(--cab-font-weight-bold);
}

.error-summary ul {
  margin: 0;
  padding-left: var(--cab-space-4);
}

.conduct p {
  margin-bottom: var(--cab-space-2);
}

.conduct a {
  color: var(--cab-color-text-default);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.conduct a:focus-visible {
  outline: 3px solid var(--cab-color-focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

.actions {
  display: flex;
  justify-content: flex-start;
}

.status {
  min-height: 1.5em;
  margin-top: var(--cab-space-3);
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
  font-weight: var(--cab-font-weight-medium);
}
</style>
