<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CabButton,
  CabCard,
  CabCheckbox,
  CabDialog,
  CabSelect,
  CabSwitch,
  CabTabs,
  CabTextField,
} from '@eltonbautista/vue'

const name = ref('')
const email = ref('')
const level = ref<string | null>(null)
const newsletter = ref(true)
const terms = ref(false)
const submitted = ref(false)
const confirmOpen = ref(false)

const levelOptions = [
  { value: 'new', label: 'New to game design' },
  { value: 'hobby', label: 'Hobbyist' },
  { value: 'student', label: 'Student' },
  { value: 'pro', label: 'Professional' },
]

const nameError = computed(() => (submitted.value && !name.value.trim() ? 'Enter your name.' : undefined))
const emailError = computed(() => {
  if (!submitted.value) return undefined
  if (!email.value.trim()) return 'Enter your email address.'
  if (!/^\S+@\S+\.\S+$/.test(email.value)) return 'Enter an email like name@example.com.'
  return undefined
})
const levelError = computed(() => (submitted.value && !level.value ? 'Choose your experience level.' : undefined))
const termsError = computed(() => (submitted.value && !terms.value ? 'Accept the terms to sign up.' : undefined))

function onSubmit() {
  submitted.value = true
  if (nameError.value || emailError.value || levelError.value || termsError.value) return
  confirmOpen.value = true
}

function reset() {
  confirmOpen.value = false
  name.value = ''
  email.value = ''
  level.value = null
  newsletter.value = true
  terms.value = false
  submitted.value = false
}

const tab = ref('schedule')
const tabs = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'venue', label: 'Venue' },
  { id: 'faq', label: 'FAQ' },
]
const copy: Record<string, string> = {
  schedule: 'Saturday 10:00 to 17:00: prototyping. Sunday 10:00 to 15:00: playtests and demos.',
  venue: 'The Old Arcade, 12 Pinball Lane. Step-free entrance on the east side.',
  faq: 'No experience needed. Bring a laptop if you have one; paper prototyping kits are provided.',
}
</script>

<template>
  <main class="page">
    <CabCard title="Weekend game-design workshop" :heading-level="1">
      <p class="text">
        Two days of prototyping, playtesting and pizza. Sign up to save your seat.
      </p>
    </CabCard>

    <CabCard title="Sign up" :heading-level="2">
      <form class="form" novalidate @submit.prevent="onSubmit">
        <CabTextField
          v-model="name"
          label="Name"
          autocomplete="name"
          required
          :error="nameError"
        />
        <CabTextField
          v-model="email"
          label="Email"
          type="email"
          autocomplete="email"
          required
          :error="emailError"
        />
        <CabSelect
          v-model="level"
          label="Experience level"
          :options="levelOptions"
          :error="levelError"
        />
        <CabSwitch v-model="newsletter" label="Send me the newsletter" />
        <div>
          <CabCheckbox v-model="terms" label="I agree to the terms and code of conduct" />
          <p v-if="termsError" class="error" role="alert">{{ termsError }}</p>
        </div>
        <CabButton type="submit">Save my seat</CabButton>
      </form>
    </CabCard>

    <CabCard title="Workshop details" :heading-level="2">
      <CabTabs v-model="tab" :tabs="tabs" label="Workshop details">
        <template #panel="{ tab: t }">
          <p class="text">{{ copy[t.id] }}</p>
        </template>
      </CabTabs>
    </CabCard>

    <CabDialog
      v-model:open="confirmOpen"
      title="You're signed up!"
      :description="`Thanks, ${name}. We'll email a confirmation to ${email}.`"
    >
      <p class="text">See you at the workshop.</p>
      <template #footer>
        <CabButton @click="reset">Done</CabButton>
      </template>
    </CabDialog>
  </main>
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
.page {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--cab-space-7) var(--cab-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--cab-space-6);
}
.form {
  display: flex;
  flex-direction: column;
  gap: var(--cab-space-5);
}
.text {
  margin: 0;
  font-size: var(--cab-font-size-md);
}
.error {
  margin: var(--cab-space-1) 0 0;
  font-size: var(--cab-font-size-sm);
  color: var(--cab-color-danger-text);
}
</style>
