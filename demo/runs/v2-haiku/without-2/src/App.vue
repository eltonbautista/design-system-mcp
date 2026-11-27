<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
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
    blurb: 'Design rules, components and pieces, then playtest them across a table.',
  },
  {
    title: 'Digital',
    href: '/tracks/digital',
    blurb: 'Prototype and build a small game for the screen, from first idea to playable build.',
  },
  {
    title: 'Live-action',
    href: '/tracks/larp',
    blurb: 'Write roles, scenes and rules for games played with bodies, voices and props.',
  },
]

const experienceOptions: CabSelectOption[] = [
  { value: 'new', label: 'New to game design' },
  { value: 'some', label: 'Some experience' },
  { value: 'experienced', label: 'Experienced designer' },
  { value: 'professional', label: 'Professional' },
]

// ---- Sign-up form -------------------------------------------------------

type Field = 'name' | 'email' | 'experience' | 'conduct'

const form = reactive({
  name: '',
  email: '',
  experience: null as string | null,
  conduct: false,
})

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Messages for every field that currently fails validation.
const problems = computed(() => {
  const found: Partial<Record<Field, string>> = {}
  if (!form.name.trim()) found.name = 'Enter your name.'
  if (!form.email.trim()) found.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(form.email.trim())) {
    found.email = 'Enter an email address like name@example.com.'
  }
  if (!form.experience) found.experience = 'Choose an experience level.'
  if (!form.conduct) found.conduct = 'Accept the code of conduct to book a seat.'
  return found
})

const problemList = computed(() => Object.values(problems.value))

// Errors only appear after the first submit attempt, then update live as the user fixes them.
const attempted = ref(false)
const shown = computed<Partial<Record<Field, string>>>(() =>
  attempted.value ? problems.value : {},
)

const nameField = ref<HTMLElement | null>(null)
const emailField = ref<HTMLElement | null>(null)
const experienceField = ref<HTMLElement | null>(null)
const conductField = ref<HTMLElement | null>(null)
const errorSummary = ref<HTMLElement | null>(null)

const CONDUCT_ERROR_ID = 'conduct-error'

// CabCheckbox has no error prop, so link the error to its input ourselves.
watch(
  () => shown.value.conduct,
  async (message) => {
    await nextTick()
    const input = conductField.value?.querySelector('input')
    if (!input) return
    if (message) {
      input.setAttribute('aria-invalid', 'true')
      input.setAttribute('aria-describedby', CONDUCT_ERROR_ID)
    } else {
      input.removeAttribute('aria-invalid')
      input.removeAttribute('aria-describedby')
    }
  },
)

const confirmOpen = ref(false)
const booked = ref(false)
const bookedHeading = ref<HTMLElement | null>(null)

const experienceLabel = computed(
  () => experienceOptions.find((option) => option.value === form.experience)?.label ?? '',
)

function onSubmit() {
  attempted.value = true
  if (problemList.value.length > 0) {
    // Move focus to the error summary so screen reader users hear what to fix.
    nextTick(() => errorSummary.value?.focus())
    return
  }
  // Nothing is booked yet: ask the attendee to confirm first.
  confirmOpen.value = true
}

function confirmBooking() {
  // TODO: send the booking to the backend here. None exists in this demo yet.
  confirmOpen.value = false
  booked.value = true
  nextTick(() => bookedHeading.value?.focus())
}

// ---- Email reminders (saves immediately, no save button) -----------------

const REMINDER_KEY = 'workshop.emailReminders'

function readReminderPreference(): boolean {
  try {
    return localStorage.getItem(REMINDER_KEY) === 'on'
  } catch {
    return false
  }
}

const reminders = ref(readReminderPreference())
const reminderStatus = ref('')

watch(reminders, (on) => {
  try {
    localStorage.setItem(REMINDER_KEY, on ? 'on' : 'off')
    reminderStatus.value = on ? 'Email reminders are on. Saved.' : 'Email reminders are off. Saved.'
  } catch {
    reminderStatus.value = 'We could not save your choice. Try again.'
  }
})
</script>

<template>
  <main>
    <header>
      <h1>Weekend game design workshop</h1>
      <p class="intro">
        Spend a weekend making games with other designers. Pick a track, book a seat and tell us
        a little about your experience.
      </p>
    </header>

    <section aria-labelledby="tracks-heading">
      <h2 id="tracks-heading">Choose a track</h2>
      <ul class="tracks">
        <li v-for="track in tracks" :key="track.href">
          <CabCard :title="track.title" :href="track.href" :heading-level="3">
            <p>{{ track.blurb }}</p>
          </CabCard>
        </li>
      </ul>
    </section>

    <section v-if="!booked" aria-labelledby="signup-heading">
      <h2 id="signup-heading">Book your seat</h2>
      <p>All fields are required.</p>

      <div v-if="attempted && problemList.length > 0" ref="errorSummary" class="error-summary" tabindex="-1">
        <h3>Fix these problems to continue</h3>
        <ul>
          <li v-for="message in problemList" :key="message">{{ message }}</li>
        </ul>
      </div>

      <form class="signup" novalidate @submit.prevent="onSubmit">
        <div ref="nameField">
          <CabTextField
            v-model="form.name"
            label="Name"
            autocomplete="name"
            required
            :error="shown.name"
          />
        </div>

        <div ref="emailField">
          <CabTextField
            v-model="form.email"
            label="Email"
            type="email"
            autocomplete="email"
            hint="We will send your booking confirmation here."
            required
            :error="shown.email"
          />
        </div>

        <div ref="experienceField">
          <CabSelect
            v-model="form.experience"
            label="Experience level"
            placeholder="Choose a level"
            :options="experienceOptions"
            :error="shown.experience"
          />
        </div>

        <div ref="conductField" class="conduct">
          <CabCheckbox v-model="form.conduct" label="I accept the workshop code of conduct" />
          <p v-if="shown.conduct" :id="CONDUCT_ERROR_ID" class="field-error">
            {{ shown.conduct }}
          </p>
        </div>

        <div>
          <CabButton type="submit" variant="primary">Review booking</CabButton>
        </div>
      </form>
    </section>

    <section v-else aria-labelledby="booked-heading">
      <h2 id="booked-heading" ref="bookedHeading" tabindex="-1">Your seat is booked</h2>
      <p>Thanks, {{ form.name.trim() }}. Your booking confirmation will go to {{ form.email.trim() }}.</p>
    </section>

    <section aria-labelledby="reminders-heading">
      <h2 id="reminders-heading">Email reminders</h2>
      <p>Get an email reminder before the workshop starts. Your choice saves as soon as you change it.</p>
      <CabSwitch v-model="reminders" label="Email reminders" />
      <p role="status" class="status">{{ reminderStatus }}</p>
    </section>

    <CabDialog
      v-model:open="confirmOpen"
      title="Confirm your seat"
      description="Nothing is booked until you confirm."
    >
      <dl class="summary">
        <dt>Name</dt>
        <dd>{{ form.name.trim() }}</dd>
        <dt>Email</dt>
        <dd>{{ form.email.trim() }}</dd>
        <dt>Experience level</dt>
        <dd>{{ experienceLabel }}</dd>
      </dl>
      <template #footer>
        <CabButton variant="ghost" @click="confirmOpen = false">Go back and edit</CabButton>
        <CabButton variant="primary" @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </main>
</template>

<style scoped>
main {
  box-sizing: border-box;
  max-width: 56rem;
  margin: 0 auto;
  padding: var(--cab-space-6) var(--cab-space-4);
  font-family: var(--cab-font-family-body);
  font-size: var(--cab-font-size-md);
  color: var(--cab-color-text-default);
}

h1,
h2 {
  font-family: var(--cab-font-family-display);
  font-weight: var(--cab-font-weight-heavy);
  line-height: 1.2;
  margin: 0 0 var(--cab-space-3);
}

h1 {
  font-size: var(--cab-font-size-2xl);
}

h2 {
  font-size: var(--cab-font-size-xl);
}

h3 {
  font-size: var(--cab-font-size-lg);
  margin: 0 0 var(--cab-space-2);
}

p {
  margin: 0 0 var(--cab-space-3);
}

.intro {
  font-size: var(--cab-font-size-lg);
  color: var(--cab-color-text-muted);
  max-width: 40rem;
}

section {
  margin-block: var(--cab-space-7);
}

h2[tabindex='-1']:focus {
  outline: 3px solid var(--cab-color-focus-ring);
  outline-offset: 4px;
}

.tracks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--cab-space-4);
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}

.tracks p {
  color: var(--cab-color-text-muted);
  margin: 0;
}

.signup {
  display: grid;
  gap: var(--cab-space-4);
  max-width: 30rem;
}

.error-summary {
  border: 2px solid var(--cab-color-danger-text);
  border-radius: var(--cab-radius-md);
  padding: var(--cab-space-3) var(--cab-space-4);
  margin-bottom: var(--cab-space-4);
  color: var(--cab-color-danger-text);
  max-width: 30rem;
}

.error-summary:focus {
  outline: 3px solid var(--cab-color-focus-ring);
  outline-offset: 2px;
}

.error-summary ul {
  margin: 0;
  padding-left: var(--cab-space-4);
}

.field-error {
  color: var(--cab-color-danger-text);
  font-size: var(--cab-font-size-sm);
  margin: var(--cab-space-1) 0 0;
}

.status {
  min-height: 1.5em;
  margin-top: var(--cab-space-3);
  color: var(--cab-color-text-muted);
}

.summary {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--cab-space-2) var(--cab-space-4);
  margin: 0 0 var(--cab-space-4);
}

.summary dt {
  color: var(--cab-color-text-muted);
}

.summary dd {
  margin: 0;
}
</style>
