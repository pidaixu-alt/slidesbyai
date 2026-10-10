<script setup lang="ts">
const { updatePassword } = useAuth()

useSeoMeta({
  title: 'Reset password — Slides by AI',
  description: 'Set a new password for your Slides by AI account.',
})

const password = ref('')
const confirm = ref('')
const busy = ref(false)
const error = ref('')
const saved = ref(false)
const ready = ref(false)
const hasRecovery = ref(false)

onMounted(async () => {
  const supabase = useSupabase()
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' || session) hasRecovery.value = true
  })
  const { data } = await supabase.auth.getSession()
  if (data.session) hasRecovery.value = true
  if (!hasRecovery.value) {
    await new Promise((r) => setTimeout(r, 500))
    const again = await supabase.auth.getSession()
    if (again.data.session) hasRecovery.value = true
  }
  ready.value = true
})

async function onSubmit() {
  if (busy.value) return
  error.value = ''
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match.'
    return
  }
  busy.value = true
  try {
    await updatePassword(password.value)
    saved.value = true
  } catch (e: any) {
    const raw = String(e?.message || '')
    error.value = raw.toLowerCase().includes('session')
      ? 'This reset link is invalid or expired. Request a new one.'
      : 'Could not update password. Please try again.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <SiteHeader hide-auth />
    <section class="section" style="padding-top: 28px; max-width: 480px">
      <p class="quota-kicker">Your Slides by AI account</p>
      <h1 style="font-size: 28px">Set a new password</h1>

      <p v-if="!ready" class="quota-copy">Checking your reset link…</p>

      <template v-else-if="saved">
        <p class="auth-notice">Password updated. You can log in with it now.</p>
        <NuxtLink class="quota-cta" to="/" style="margin-top: 16px; text-align: center">Back to Slides by AI</NuxtLink>
      </template>

      <template v-else-if="!hasRecovery">
        <p class="quota-copy">This reset link is invalid or expired. Open the login window and tap Forgot password to get a new email.</p>
        <NuxtLink class="quota-cta" to="/" style="margin-top: 8px; text-align: center">Back to Slides by AI</NuxtLink>
      </template>

      <form v-else class="auth-form" style="margin-top: 18px" @submit.prevent="onSubmit">
        <label>
          New password
          <input v-model="password" type="password" autocomplete="new-password" required minlength="6" placeholder="At least 6 characters" />
        </label>
        <label>
          Confirm password
          <input v-model="confirm" type="password" autocomplete="new-password" required minlength="6" placeholder="Type it again" />
        </label>
        <p v-if="error" class="auth-error">{{ error }}</p>
        <button class="quota-cta" type="submit" :disabled="busy">{{ busy ? 'Saving…' : 'Save new password' }}</button>
      </form>
    </section>
    <SiteFooter />
  </div>
</template>
