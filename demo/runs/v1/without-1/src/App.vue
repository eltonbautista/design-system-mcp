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
import type { CabSelectOption, CabTab } from '@eltonbautista/vue'

const name = ref('')
const email = ref('')
const level = ref<string | null>(null)
const newsletter = ref(false)
const terms = ref(false)
const submitted = ref(false)
const showConfirm = ref(false)
const activeTab = ref('schedule')

const levelOptions: CabSelectOption[] = [
  { value: 'beginner', label: 'Beginner: never designed a game' },
  { value: 'intermediate', label: 'Intermediate: a few prototypes' },
  { value: 'advanced', label: 'Advanced: shipped a game' },
]

const tabs: CabTab[] = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'venue', label: 'Venue' },
  { id: 'faq', label: 'FAQ' },
]

const errors = computed(() => ({
  name: submitted.value && !name.value.trim() ? 'Enter your name.' : '',
  email:
    submitted.value && !/^\S+@\S+\.\S+$/.test(email.value) ? 'Enter a valid email address.' : '',
  level: submitted.value && !level.value ? 'Choose your experience level.' : '',
  terms: submitted.value && !terms.value ? 'You need to accept the terms to sign up.' : '',
}))

const levelLabel = computed(
  () => levelOptions.find((o) => o.value === level.value)?.label ?? '',
)

function onSubmit() {
  submitted.value = true
  if (Object.values(errors.value).some(Boolean)) return
  showConfirm.value = true
}

function reset() {
  showConfirm.value = false
  submitted.value = false
  name.value = ''
  email.value = ''
  level.value = null
  newsletter.value = false
  terms.value = false
}
</script>

<template>
  <main class="page">
    <CabCard as="section" title="Weekend Game-Design Workshop" :heading-level="2">
      <p class="lead">
        Two days, one prototype. Pitch an idea on Saturday morning and play-test a finished game on
        Sunday afternoon.
      </p>
      <template #footer>
        <span class="meta">Sat–Sun · 10:00–17:00 · 24 seats</span>
      </template>
    </CabCard>

    <CabCard as="section" title="Save your seat" :heading-level="2">
      <form class="form" novalidate @submit.prevent="onSubmit">
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
          hint="We'll send your ticket here."
          :error="errors.email"
        />
        <CabSelect
          v-model="level"
          label="Experience level"
          placeholder="Choose a level"
          :options="levelOptions"
          :error="errors.level"
        />
        <CabSwitch v-model="newsletter" label="Send me the newsletter" />
        <CabCheckbox
          v-model="terms"
          label="I agree to the workshop terms"
          :hint="errors.terms || undefined"
        />
        <div class="actions">
          <CabButton type="submit" size="lg">Sign up</CabButton>
        </div>
      </form>
    </CabCard>

    <CabCard as="section" title="Workshop details" :heading-level="2">
      <CabTabs v-model="activeTab" :tabs="tabs" label="Workshop details">
        <template #panel="{ tab }">
          <ul v-if="tab.id === 'schedule'" class="list">
            <li><strong>Sat 10:00</strong> Pitch jam and team forming</li>
            <li><strong>Sat 13:00</strong> Paper prototyping</li>
            <li><strong>Sun 10:00</strong> Digital build session</li>
            <li><strong>Sun 15:00</strong> Play-test showcase</li>
          </ul>
          <p v-else-if="tab.id === 'venue'">
            The Annex Studio, 12 Arcade Lane. Step-free access, bike storage and a quiet room are
            available. Lunch is provided both days.
          </p>
          <dl v-else class="list">
            <dt>Do I need to bring a laptop?</dt>
            <dd>Yes for Sunday's build session. Saturday is all paper and pens.</dd>
            <dt>Can I come without a team?</dt>
            <dd>Absolutely. Teams form on Saturday morning.</dd>
            <dt>What if I need to cancel?</dt>
            <dd>Cancel up to 48 hours before and we'll release your seat.</dd>
          </dl>
        </template>
      </CabTabs>
    </CabCard>

    <CabDialog
      v-model:open="showConfirm"
      title="You're signed up!"
      :description="`See you on Saturday, ${name}.`"
    >
      <p>
        A confirmation is on its way to {{ email }}. Experience level: {{ levelLabel }}.
        {{ newsletter ? "You're subscribed to the newsletter." : 'No newsletter, as requested.' }}
      </p>
      <template #footer>
        <CabButton @click="reset">Done</CabButton>
      </template>
    </CabDialog>
  </main>
</template>

<style scoped>
.page {
  display: grid;
  gap: var(--cab-space-6);
  max-width: 44rem;
  margin: 0 auto;
  padding: var(--cab-space-7) var(--cab-space-4);
  background: var(--cab-color-bg-canvas);
  color: var(--cab-color-text-default);
  font-family: var(--cab-font-family-body);
}
.lead {
  margin: 0;
  font-size: var(--cab-font-size-lg);
}
.meta {
  color: var(--cab-color-text-muted);
  font-size: var(--cab-font-size-sm);
}
.form {
  display: grid;
  gap: var(--cab-space-4);
}
.actions {
  display: flex;
  justify-content: flex-end;
}
.list {
  margin: 0;
  padding-left: var(--cab-space-5);
  display: grid;
  gap: var(--cab-space-2);
}
dt {
  font-weight: var(--cab-font-weight-bold);
}
dd {
  margin: 0 0 var(--cab-space-2);
  color: var(--cab-color-text-muted);
}
</style>
