<script setup lang="ts">
import { nextTick, ref } from 'vue'
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
  { title: 'Board games', href: '/tracks/board', text: 'Prototype with cards, dice and tokens. Playtest by lunchtime.' },
  { title: 'Digital', href: '/tracks/digital', text: 'Build a small playable game on screen, from first idea to first level.' },
  { title: 'Live-action', href: '/tracks/larp', text: 'Design a story-driven game where the players are the characters.' },
]

const levels = [
  { value: 'beginner', label: 'Beginner: new to game design' },
  { value: 'intermediate', label: 'Intermediate: made a game or two' },
  { value: 'advanced', label: 'Advanced: I design regularly' },
]

const form = ref<HTMLFormElement | null>(null)
const name = ref('')
const email = ref('')
const level = ref<string | null>(null)
const accepted = ref(false)
const submitted = ref(false)
const errors = ref<{ name?: string; email?: string; level?: string; accepted?: string }>({})

const confirmOpen = ref(false)
const booked = ref(false)

// Email reminders: saved immediately on change, no save button.
const reminders = ref(false)
const reminderStatus = ref('')
function setReminders(value: boolean) {
  reminders.value = value
  // Persist right away (replace with a real API call).
  reminderStatus.value = value ? 'Email reminders turned on. Saved.' : 'Email reminders turned off. Saved.'
}

function validate() {
  const e: typeof errors.value = {}
  if (!name.value.trim()) e.name = 'Enter your name.'
  if (!email.value.trim()) e.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
    e.email = 'Enter an email address like name@example.com.'
  if (!level.value) e.level = 'Choose your experience level.'
  if (!accepted.value) e.accepted = 'Accept the code of conduct to sign up.'
  errors.value = e
  return e
}

async function onSubmit() {
  const e = validate()
  const first = (['name', 'email', 'level', 'accepted'] as const).find((k) => e[k])
  if (first) {
    await nextTick()
    const root = form.value
    const target = {
      name: 'input[type="text"]',
      email: 'input[type="email"]',
      level: '[role="combobox"]',
      accepted: 'input[type="checkbox"]',
    }[first]
    root?.querySelector<HTMLElement>(target)?.focus()
    return
  }
  confirmOpen.value = true
}

function confirmBooking() {
  confirmOpen.value = false
  booked.value = true
  submitted.value = true
}
</script>

<template>
  <div class="page">
    <a class="skip" href="#signup">Skip to sign-up</a>
    <main class="main">
      <header>
        <h1>Game Design Weekend</h1>
        <p class="intro">
          Two days of making games with other people. Pick a track, build something playable and
          test it with the group. No experience needed.
        </p>
      </header>

      <section aria-labelledby="tracks-heading">
        <h2 id="tracks-heading">Choose a track</h2>
        <ul class="tracks">
          <li v-for="t in tracks" :key="t.href">
            <CabCard :title="t.title" :href="t.href" :heading-level="3">
              <p>{{ t.text }}</p>
            </CabCard>
          </li>
        </ul>
      </section>

      <section id="signup" aria-labelledby="signup-heading" tabindex="-1">
        <h2 id="signup-heading">Sign up</h2>

        <p v-if="booked" role="status" class="success">
          You're booked, {{ name }}. We've sent details to {{ email }}.
        </p>

        <form v-else ref="form" class="form" novalidate @submit.prevent="onSubmit">
          <p class="note">Fields marked * are required.</p>
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
            :options="levels"
            placeholder="Choose a level"
            :error="errors.level"
          />
          <div>
            <CabCheckbox v-model="accepted" label="I accept the code of conduct" />
            <p v-if="errors.accepted" class="error" role="alert">{{ errors.accepted }}</p>
          </div>
          <div>
            <CabButton type="submit" variant="primary">Review booking</CabButton>
          </div>
        </form>
      </section>

      <section aria-labelledby="reminders-heading">
        <h2 id="reminders-heading">Notifications</h2>
        <CabSwitch
          :model-value="reminders"
          label="Email reminders"
          @update:model-value="setReminders"
        />
        <p class="status" role="status" aria-live="polite">{{ reminderStatus }}</p>
      </section>
    </main>

    <CabDialog
      v-model:open="confirmOpen"
      title="Confirm your booking"
      description="Check your details before we book your place."
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
        <CabButton variant="primary" @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </div>
</template>

<style scoped>
.page {
  background: var(--cab-color-bg-canvas);
  color: var(--cab-color-text-default);
  font-family: var(--cab-font-family-body);
  min-height: 100vh;
}
.main {
  max-width: 60rem;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}
.intro {
  max-width: 40rem;
  font-size: 1.125rem;
  line-height: 1.5;
}
h1,
h2 {
  margin: 0 0 var(--cab-space-3);
  font-family: var(--cab-font-family-display);
}
.tracks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}
.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 28rem;
}
.note,
.status {
  margin: 0;
}
.error {
  margin: 0.25rem 0 0;
  color: var(--cab-color-danger-text);
  font-weight: 600;
}
.success {
  font-weight: 600;
}
.summary {
  margin: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.5rem 1rem;
}
.summary dt {
  font-weight: 600;
}
.summary dd {
  margin: 0;
}
.skip {
  position: absolute;
  left: -999px;
}
.skip:focus {
  left: 1rem;
  top: 1rem;
  z-index: 10;
  background: var(--cab-color-bg-surface);
  color: var(--cab-color-text-default);
  padding: var(--cab-space-2) var(--cab-space-4);
}
</style>
