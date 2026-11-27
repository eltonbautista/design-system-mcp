<script setup lang="ts">
import { nextTick, reactive, ref, useTemplateRef } from 'vue'
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
  { title: 'Board games', href: '/tracks/board', blurb: 'Mechanics, playtesting and paper prototypes.' },
  { title: 'Digital', href: '/tracks/digital', blurb: 'Build a small playable game in two days.' },
  { title: 'Live-action', href: '/tracks/larp', blurb: 'Design roles, rules and stories for in-person play.' },
]

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const form = reactive({ name: '', email: '', level: null as string | null, conduct: false })
const errors = reactive({ name: '', email: '', level: '', conduct: '' })

const formEl = useTemplateRef<HTMLFormElement>('formEl')
const confirmOpen = ref(false)
const statusMsg = ref('')

const reminders = ref(true)
const reminderStatus = ref('')
function onReminders(value: boolean) {
  reminders.value = value
  // Saved immediately; announce through a polite live region.
  reminderStatus.value = value ? 'Email reminders turned on.' : 'Email reminders turned off.'
}

function validate() {
  errors.name = form.name.trim() ? '' : 'Enter your name.'
  errors.email = !form.email.trim()
    ? 'Enter your email address.'
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? ''
      : 'Enter an email address like name@example.com.'
  errors.level = form.level ? '' : 'Choose your experience level.'
  errors.conduct = form.conduct ? '' : 'You must accept the code of conduct to sign up.'
  return !Object.values(errors).some(Boolean)
}

async function onSubmit() {
  statusMsg.value = ''
  if (validate()) {
    confirmOpen.value = true
    return
  }
  await nextTick()
  formEl.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}

function confirmBooking() {
  confirmOpen.value = false
  statusMsg.value = `Thanks ${form.name}, your seat is booked. We will email ${form.email}.`
}
</script>

<template>
  <header class="site-header">
    <p class="eyebrow">Weekend workshop</p>
  </header>
  <main id="main" class="page">
    <section aria-labelledby="page-title" class="intro">
      <h1 id="page-title">Game Design Weekend</h1>
      <p>
        Two days of making, playing and breaking games. Pick a track, meet fellow designers
        and leave with a prototype you can share. No prior experience required.
      </p>
    </section>

    <section aria-labelledby="tracks-title">
      <h2 id="tracks-title">Choose a track</h2>
      <ul class="tracks">
        <li v-for="t in tracks" :key="t.href">
          <CabCard :title="t.title" :href="t.href" :heading-level="3">
            <p>{{ t.blurb }}</p>
          </CabCard>
        </li>
      </ul>
    </section>

    <section aria-labelledby="signup-title">
      <h2 id="signup-title">Sign up</h2>
      <form ref="formEl" class="form" novalidate @submit.prevent="onSubmit">
        <CabTextField v-model="form.name" label="Name" autocomplete="name" required :error="errors.name" />
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
          placeholder="Select a level"
          :options="levels"
          :error="errors.level"
        />
        <div>
          <CabCheckbox v-model="form.conduct" label="I accept the code of conduct (required)" />
          <p v-if="errors.conduct" class="error" role="alert">{{ errors.conduct }}</p>
        </div>
        <div>
          <CabButton type="submit">Review booking</CabButton>
        </div>
      </form>
      <p class="status" role="status">{{ statusMsg }}</p>
    </section>

    <section aria-labelledby="reminders-title">
      <h2 id="reminders-title">Notifications</h2>
      <CabSwitch :model-value="reminders" label="Email reminders" @update:model-value="onReminders" />
      <p class="status" role="status">{{ reminderStatus }}</p>
    </section>

    <CabDialog
      v-model:open="confirmOpen"
      title="Confirm your booking"
      description="Your seat is only booked once you confirm."
    >
      <dl class="summary">
        <dt>Name</dt>
        <dd>{{ form.name }}</dd>
        <dt>Email</dt>
        <dd>{{ form.email }}</dd>
        <dt>Experience</dt>
        <dd>{{ levels.find((l) => l.value === form.level)?.label }}</dd>
      </dl>
      <template #footer>
        <CabButton variant="secondary" @click="confirmOpen = false">Go back</CabButton>
        <CabButton @click="confirmBooking">Confirm booking</CabButton>
      </template>
    </CabDialog>
  </main>
</template>

<style scoped>
.site-header,
.page {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}
.page {
  display: grid;
  gap: 2.5rem;
  padding-bottom: 4rem;
}
.eyebrow {
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
h1,
h2 {
  margin: 0 0 0.75rem;
}
.intro p {
  max-width: 40rem;
  margin: 0;
}
.tracks {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}
.form {
  display: grid;
  gap: 1.25rem;
  max-width: 28rem;
}
.error {
  margin: 0.25rem 0 0;
  color: #b00020;
}
.status {
  min-height: 1.5em;
  margin: 0.75rem 0 0;
}
.summary {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
  margin: 0;
}
.summary dt {
  font-weight: 600;
}
.summary dd {
  margin: 0;
}
</style>
