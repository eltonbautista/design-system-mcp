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
    text: 'Prototype with cards, dice and tokens. Learn mechanics, balance and playtesting.',
  },
  {
    title: 'Digital',
    href: '/tracks/digital',
    text: 'Build a small playable game on screen. Covers game loops, input and feedback.',
  },
  {
    title: 'Live-action',
    href: '/tracks/larp',
    text: 'Design a live-action roleplay. Explore characters, rules for play and safety.',
  },
]

const levels = [
  { value: 'beginner', label: 'Beginner: new to game design' },
  { value: 'intermediate', label: 'Intermediate: I have made a game or two' },
  { value: 'advanced', label: 'Advanced: I design games regularly' },
]

const name = ref('')
const email = ref('')
const level = ref<string | null>(null)
const conduct = ref(false)

const errors = ref<{ name?: string; email?: string; level?: string; conduct?: string }>({})
const errorList = computed(() => Object.values(errors.value).filter(Boolean) as string[])
const summaryEl = ref<HTMLElement | null>(null)

function validate() {
  const e: typeof errors.value = {}
  if (!name.value.trim()) e.name = 'Enter your name.'
  if (!email.value.trim()) e.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
    e.email = 'Enter an email address like name@example.com.'
  if (!level.value) e.level = 'Choose your experience level.'
  if (!conduct.value) e.conduct = 'Accept the code of conduct to sign up.'
  errors.value = e
  return Object.keys(e).length === 0
}

const confirmOpen = ref(false)
const booked = ref(false)

async function onSubmit() {
  booked.value = false
  if (!validate()) {
    await nextTick()
    summaryEl.value?.focus()
    return
  }
  confirmOpen.value = true
}

const levelLabel = computed(() => levels.find((l) => l.value === level.value)?.label ?? '')

function confirmBooking() {
  confirmOpen.value = false
  booked.value = true
}

// Email reminders: saved immediately on change, no save button.
const reminders = ref(false)
const reminderStatus = ref('')
watch(reminders, (on) => {
  // Stand-in for a real request; replace with an API call.
  reminderStatus.value = `Email reminders turned ${on ? 'on' : 'off'}. Saved.`
})
</script>

<template>
  <a class="skip" href="#signup">Skip to sign-up</a>

  <header class="hero">
    <h1>Weekend Game-Design Workshop</h1>
    <p class="lead">
      Two days of making, playing and testing games with other designers. Pick a track, bring
      curiosity, and leave with a game you can share. No experience needed.
    </p>
  </header>

  <main>
    <section aria-labelledby="tracks-h" class="block">
      <h2 id="tracks-h">Choose a track</h2>
      <ul class="tracks">
        <li v-for="t in tracks" :key="t.href">
          <CabCard :title="t.title" :href="t.href">
            <p>{{ t.text }}</p>
          </CabCard>
        </li>
      </ul>
    </section>

    <section aria-labelledby="reminders-h" class="block">
      <h2 id="reminders-h">Reminders</h2>
      <CabSwitch v-model="reminders" label="Email reminders" />
      <p class="status" role="status">{{ reminderStatus }}</p>
    </section>

    <section id="signup" aria-labelledby="signup-h" class="block">
      <h2 id="signup-h">Sign up</h2>

      <p v-if="booked" class="success" role="status">
        You're booked in, {{ name }}. We'll send details to {{ email }}.
      </p>

      <form novalidate @submit.prevent="onSubmit">
        <div
          v-if="errorList.length"
          ref="summaryEl"
          class="summary"
          role="alert"
          tabindex="-1"
        >
          <h3>Please fix {{ errorList.length }} {{ errorList.length === 1 ? 'problem' : 'problems' }}</h3>
          <ul>
            <li v-for="msg in errorList" :key="msg">{{ msg }}</li>
          </ul>
        </div>

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
          hint="We'll use this to confirm your booking."
          required
          :error="errors.email"
        />
        <CabSelect
          v-model="level"
          label="Experience level"
          placeholder="Select your level"
          :options="levels"
          :error="errors.level"
        />

        <div class="conduct">
          <CabCheckbox
            v-model="conduct"
            label="I accept the code of conduct"
            hint="Be respectful, play fair and look after each other's safety."
          />
          <p v-if="errors.conduct" class="field-error">{{ errors.conduct }}</p>
        </div>

        <CabButton type="submit">Sign up</CabButton>
      </form>
    </section>
  </main>

  <CabDialog
    v-model:open="confirmOpen"
    title="Confirm your booking"
    description="Check your details, then confirm to book your place."
  >
    <dl class="details">
      <dt>Name</dt>
      <dd>{{ name }}</dd>
      <dt>Email</dt>
      <dd>{{ email }}</dd>
      <dt>Experience</dt>
      <dd>{{ levelLabel }}</dd>
    </dl>
    <template #footer>
      <CabButton variant="secondary" @click="confirmOpen = false">Go back</CabButton>
      <CabButton @click="confirmBooking">Confirm booking</CabButton>
    </template>
  </CabDialog>
</template>

<style>
body {
  margin: 0;
  background: var(--cab-color-bg-canvas);
  color: var(--cab-color-text-default);
  font-family: var(--cab-font-family-body);
}
.skip {
  position: absolute;
  left: 0.5rem;
  top: -4rem;
  padding: 0.5rem 1rem;
  background: var(--cab-color-bg-surface);
  color: var(--cab-color-text-default);
  z-index: 10;
}
.skip:focus {
  top: 0.5rem;
}
.hero,
main {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 0;
}
.lead {
  font-size: 1.125rem;
  max-width: 40rem;
}
.block {
  margin-block: 2.5rem;
}
.tracks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}
form {
  display: grid;
  gap: 1.25rem;
  max-width: 28rem;
}
.summary {
  border: 2px solid var(--cab-color-danger-text);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
}
.summary h3 {
  margin: 0 0 0.5rem;
}
.summary ul {
  margin: 0;
  padding-left: 1.25rem;
}
.field-error {
  margin: 0.25rem 0 0;
  color: var(--cab-color-danger-text);
}
.success {
  max-width: 28rem;
  padding: 0.75rem 1rem;
  border: 2px solid currentColor;
  border-radius: 0.5rem;
}
.status {
  min-height: 1.5em;
  margin: 0.5rem 0 0;
}
.details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
  margin: 0;
}
.details dt {
  font-weight: 700;
}
.details dd {
  margin: 0;
}
</style>
