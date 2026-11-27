<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
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
  { title: 'Board games', href: '/tracks/board', text: 'Cards, dice and rules that fit on one page.' },
  { title: 'Digital', href: '/tracks/digital', text: 'Make something playable in a browser by Sunday.' },
  { title: 'Live-action', href: '/tracks/larp', text: 'Design a story that players act out together.' },
]

const levels = [
  { value: 'beginner', label: 'Beginner: new to game design' },
  { value: 'intermediate', label: 'Intermediate: made a few games' },
  { value: 'advanced', label: 'Advanced: design regularly' },
]

const name = ref('')
const email = ref('')
const level = ref<string | null>(null)
const conduct = ref(false)
const submitted = ref(false)

const errors = ref<{ name?: string; email?: string; level?: string; conduct?: string }>({})
const confirmOpen = ref(false)
const booked = ref(false)

const levelLabel = computed(() => levels.find((l) => l.value === level.value)?.label ?? '')

// Email reminders: applied immediately, no save button.
const reminders = ref(false)
const reminderStatus = ref('')
function setReminders(value: boolean) {
  reminders.value = value
  reminderStatus.value = value
    ? 'Email reminders are on. Saved.'
    : 'Email reminders are off. Saved.'
}

function validate() {
  const e: typeof errors.value = {}
  if (!name.value.trim()) e.name = 'Enter your name.'
  if (!email.value.trim()) e.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
    e.email = 'Enter an email address like name@example.com.'
  if (!level.value) e.level = 'Choose your experience level.'
  if (!conduct.value) e.conduct = 'Accept the code of conduct to sign up.'
  errors.value = e
  return e
}

async function onSubmit() {
  const e = validate()
  if (Object.keys(e).length) {
    await nextTick()
    const target =
      document.querySelector<HTMLElement>('#signup [aria-invalid="true"]') ??
      document.querySelector<HTMLElement>('#signup [data-conduct] input')
    target?.focus()
    return
  }
  confirmOpen.value = true
}

function confirmBooking() {
  confirmOpen.value = false
  booked.value = true
  nextTick(() => document.getElementById('booked-heading')?.focus())
}
</script>

<template>
  <div class="page">
    <main class="wrap">
      <header>
        <h1>Weekend Game-Design Workshop</h1>
        <p class="intro">
          Two days of making games with other designers. Pick a track, learn by building, and leave
          on Sunday with a game you can play with friends.
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

      <section aria-labelledby="signup-heading">
        <h2 id="signup-heading">Sign up</h2>

        <div v-if="booked" class="booked" role="status">
          <h3 id="booked-heading" tabindex="-1">You're booked in, {{ name }}!</h3>
          <p>We'll send a confirmation to {{ email }}.</p>
        </div>

        <form v-else id="signup" novalidate @submit.prevent="onSubmit">
          <p class="note">Fields marked with * are required.</p>

          <CabTextField
            v-model="name"
            label="Name"
            required
            autocomplete="name"
            :error="errors.name"
          />
          <CabTextField
            v-model="email"
            label="Email"
            type="email"
            required
            autocomplete="email"
            hint="We'll send your booking confirmation here."
            :error="errors.email"
          />
          <CabSelect
            v-model="level"
            label="Experience level"
            :options="levels"
            placeholder="Choose a level"
            :error="errors.level"
          />

          <div data-conduct :class="{ 'conduct-invalid': errors.conduct }">
            <CabCheckbox
              v-model="conduct"
              label="I accept the code of conduct (required)"
              :hint="errors.conduct"
            />
          </div>

          <div>
            <CabButton type="submit">Sign up</CabButton>
          </div>
        </form>
      </section>

      <section aria-labelledby="prefs-heading">
        <h2 id="prefs-heading">Preferences</h2>
        <CabSwitch :model-value="reminders" label="Email reminders" @update:model-value="setReminders" />
        <p class="sr-only" role="status">{{ reminderStatus }}</p>
        <p v-if="reminderStatus" class="note" aria-hidden="true">{{ reminderStatus }}</p>
      </section>
    </main>

    <CabDialog
      v-model:open="confirmOpen"
      title="Confirm your booking"
      description="Please check your details before we book your place."
    >
      <dl class="summary">
        <dt>Name</dt>
        <dd>{{ name }}</dd>
        <dt>Email</dt>
        <dd>{{ email }}</dd>
        <dt>Experience</dt>
        <dd>{{ levelLabel }}</dd>
      </dl>
      <template #footer>
        <CabButton variant="ghost" @click="confirmOpen = false">Go back</CabButton>
        <CabButton @click="confirmBooking">Confirm booking</CabButton>
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
  font-size: var(--cab-font-size-md);
}
</style>

<style scoped>
.wrap {
  max-width: 800px;
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
  font-weight: var(--cab-font-weight-heavy);
}
h2 {
  font-size: var(--cab-font-size-xl);
}
.intro {
  font-size: var(--cab-font-size-lg);
  margin: 0;
}
.tracks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--cab-space-5);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.tracks p {
  margin: 0;
}
form {
  display: grid;
  gap: var(--cab-space-5);
  max-width: 440px;
}
.note {
  margin: 0;
  color: var(--cab-color-text-muted);
  font-size: var(--cab-font-size-sm);
}
.conduct-invalid :deep(.cab-checkbox__hint) {
  color: var(--cab-color-danger-text);
  font-weight: var(--cab-font-weight-medium);
}
.booked {
  background: var(--cab-color-bg-surface);
  border-radius: var(--cab-radius-lg);
  box-shadow: var(--cab-shadow-ledge);
  padding: var(--cab-space-5);
  max-width: 440px;
}
.booked p {
  margin: 0;
}
.summary {
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--cab-space-2) var(--cab-space-4);
}
.summary dt {
  font-weight: var(--cab-font-weight-bold);
}
.summary dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
