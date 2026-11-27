<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
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
    blurb: 'Prototype with cards, dice and tokens. Playtest a rough design by the end of Saturday.',
  },
  {
    title: 'Digital',
    href: '/tracks/digital',
    blurb: 'Build a small playable game on screen, from first mechanic to shareable demo.',
  },
  {
    title: 'Live-action',
    href: '/tracks/larp',
    blurb: 'Design a role-playing scenario that people act out together in a room.',
  },
]

const levels: CabSelectOption[] = [
  { value: 'beginner', label: 'Beginner: new to game design' },
  { value: 'intermediate', label: 'Intermediate: made a few games' },
  { value: 'advanced', label: 'Advanced: design regularly' },
]

const form = reactive({
  name: '',
  email: '',
  level: null as string | null,
  conduct: false,
})
const errors = reactive({ name: '', email: '', level: '', conduct: '' })

const emailReminders = ref(true)
const reminderStatus = ref('')
const submitting = ref(false)
const confirmOpen = ref(false)
const booked = ref(false)
const formStatus = ref('')
const errorSummary = ref<HTMLElement | null>(null)
const bookedHeading = ref<HTMLElement | null>(null)

const errorList = computed(() => Object.values(errors).filter(Boolean))
const levelLabel = computed(() => levels.find((l) => l.value === form.level)?.label ?? '')

function validate(): boolean {
  errors.name = form.name.trim() ? '' : 'Enter your name.'
  errors.email = !form.email.trim()
    ? 'Enter your email address.'
    : /^\S+@\S+\.\S+$/.test(form.email.trim())
      ? ''
      : 'Enter an email address in the format name@example.com.'
  errors.level = form.level ? '' : 'Choose your experience level.'
  errors.conduct = form.conduct ? '' : 'Accept the code of conduct to sign up.'
  return errorList.value.length === 0
}

async function onSubmit() {
  if (!validate()) {
    await nextTick()
    errorSummary.value?.focus()
    return
  }
  confirmOpen.value = true
}

async function confirmBooking() {
  submitting.value = true
  // Placeholder for the real booking request.
  await new Promise((r) => setTimeout(r, 400))
  submitting.value = false
  confirmOpen.value = false
  booked.value = true
  await nextTick()
  bookedHeading.value?.focus()
}

// Saves immediately on change; no save button. Announced via the status region.
let saveTimer: ReturnType<typeof setTimeout> | undefined
function onReminderChange(value: boolean) {
  emailReminders.value = value
  reminderStatus.value = 'Saving…'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    reminderStatus.value = value ? 'Saved. Email reminders are on.' : 'Saved. Email reminders are off.'
  }, 300)
}
</script>

<template>
  <div class="page">
    <a class="skip" href="#signup">Skip to sign-up</a>

    <main class="main">
      <header class="hero">
        <h1>Game Design Weekend Workshop</h1>
        <p class="intro">
          Two days of making, playing and talking about games. Pick a track, build something with
          other designers, and leave with a prototype you can keep working on. Everyone is welcome,
          whatever your experience.
        </p>
      </header>

      <section aria-labelledby="tracks-heading" class="section">
        <h2 id="tracks-heading">Choose your track</h2>
        <ul class="tracks">
          <li v-for="track in tracks" :key="track.href">
            <CabCard :title="track.title" :href="track.href" :heading-level="3" as="div">
              <p>{{ track.blurb }}</p>
            </CabCard>
          </li>
        </ul>
      </section>

      <section id="signup" aria-labelledby="signup-heading" class="section" tabindex="-1">
        <h2 id="signup-heading">Sign up</h2>

        <div v-if="booked" class="booked" role="status">
          <h3 ref="bookedHeading" tabindex="-1">You're booked in</h3>
          <p>
            Thanks, {{ form.name }}. We've sent a confirmation to {{ form.email }}.
          </p>
        </div>

        <form v-else novalidate class="form" @submit.prevent="onSubmit">
          <div
            v-if="errorList.length"
            ref="errorSummary"
            class="summary"
            role="alert"
            tabindex="-1"
          >
            <h3>Please fix the following</h3>
            <ul>
              <li v-for="msg in errorList" :key="msg">{{ msg }}</li>
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
            :error="errors.email"
          />
          <CabSelect
            v-model="form.level"
            label="Experience level"
            placeholder="Choose a level"
            :options="levels"
            :error="errors.level"
          />
          <CabCheckbox
            v-model="form.conduct"
            label="I accept the code of conduct (required)"
            :hint="errors.conduct || 'Be kind, respect others\' boundaries and playtest generously.'"
          />

          <div>
            <CabButton type="submit" size="lg">Sign up</CabButton>
          </div>
        </form>
      </section>

      <section aria-labelledby="prefs-heading" class="section">
        <h2 id="prefs-heading">Preferences</h2>
        <CabSwitch
          :model-value="emailReminders"
          label="Email reminders"
          @update:model-value="onReminderChange"
        />
        <p class="status" role="status" aria-live="polite">{{ reminderStatus }}</p>
      </section>
    </main>

    <CabDialog
      v-model:open="confirmOpen"
      title="Confirm your booking"
      description="Please check your details before we book your place."
    >
      <dl class="details">
        <dt>Name</dt>
        <dd>{{ form.name }}</dd>
        <dt>Email</dt>
        <dd>{{ form.email }}</dd>
        <dt>Experience</dt>
        <dd>{{ levelLabel }}</dd>
      </dl>
      <template #footer>
        <CabButton variant="secondary" @click="confirmOpen = false">Go back</CabButton>
        <CabButton :loading="submitting" @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </div>
</template>

<style>
body {
  margin: 0;
  background: var(--cab-color-bg-canvas);
  color: var(--cab-color-text-default);
  font-family: var(--cab-font-family-body);
}
</style>

<style scoped>
.skip {
  position: absolute;
  left: var(--cab-space-3);
  top: -4rem;
  padding: var(--cab-space-2) var(--cab-space-3);
  background: var(--cab-color-bg-surface);
  color: var(--cab-color-text-default);
  border: 2px solid var(--cab-color-focus-ring);
  border-radius: var(--cab-radius-md);
  z-index: 10;
}
.skip:focus {
  top: var(--cab-space-3);
}
.main {
  max-width: 60rem;
  margin: 0 auto;
  padding: var(--cab-space-7) var(--cab-space-5);
  display: grid;
  gap: var(--cab-space-7);
}
h1,
h2,
h3 {
  font-family: var(--cab-font-family-display);
  margin: 0 0 var(--cab-space-3);
}
h1 {
  font-size: var(--cab-font-size-2xl);
}
h2 {
  font-size: var(--cab-font-size-xl);
}
.intro {
  font-size: var(--cab-font-size-lg);
  max-width: 42rem;
  margin: 0;
  line-height: 1.5;
}
.tracks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--cab-space-4);
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
}
.tracks p {
  margin: 0;
}
.form {
  display: grid;
  gap: var(--cab-space-5);
  max-width: 28rem;
}
.summary {
  border: 2px solid var(--cab-color-danger-text);
  border-radius: var(--cab-radius-md);
  padding: var(--cab-space-3) var(--cab-space-4);
  color: var(--cab-color-danger-text);
}
.summary h3 {
  font-size: var(--cab-font-size-md);
}
.summary ul {
  margin: 0;
  padding-left: var(--cab-space-5);
}
.booked {
  max-width: 28rem;
}
.status {
  margin: var(--cab-space-2) 0 0;
  min-height: 1.5em;
  color: var(--cab-color-text-muted);
}
.details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--cab-space-2) var(--cab-space-4);
  margin: 0;
}
.details dt {
  font-weight: var(--cab-font-weight-bold);
}
.details dd {
  margin: 0;
}
#signup:focus {
  outline: none;
}
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto;
  }
}
</style>
