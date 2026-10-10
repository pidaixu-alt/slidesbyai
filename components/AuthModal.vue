<script setup lang="ts">
const SITE = useSite()
const { modal, closeAuth, signIn, signUp, sendPasswordReset, authHeaders } = useAuth()

const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')
const notice = ref('')
const cooldownLeft = ref(0)
let cooldownUntil = 0
let cooldownTimer: ReturnType<typeof setInterval> | null = null

function stopCooldownTick() {
  if (!cooldownTimer) return
  clearInterval(cooldownTimer)
  cooldownTimer = null
}

function tickCooldown() {
  cooldownLeft.value = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
  if (cooldownLeft.value <= 0) stopCooldownTick()
}

function startCooldown(seconds = 60) {
  cooldownUntil = Date.now() + seconds * 1000
  tickCooldown()
  stopCooldownTick()
  cooldownTimer = setInterval(tickCooldown, 250)
}

function friendlyAuthError(e: any) {
  const raw = String(e?.data?.message || e?.statusMessage || e?.message || '')
  const lower = raw.toLowerCase()
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Email or password is incorrect.'
  }
  if (lower.includes('already registered') || lower.includes('user already')) {
    return 'This email already has an account. Log in instead.'
  }
  if (lower.includes('email not confirmed') || lower.includes('not confirmed')) {
    return 'Please confirm your email first, then try logging in again.'
  }
  if (lower.includes('no slides by ai account') || lower.includes('no tagtery account') || lower.includes('create an account first')) {
    return 'No Slides by AI account uses this email. Create an account first, then you can reset the password.'
  }
  if (lower.includes('could not send the reset')) {
    return 'Could not send the reset email. Please try again in a minute.'
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts. Please wait a minute and try again.'
  }
  return 'Could not continue. Please try again.'
}

const isSignup = computed(() => modal.value.mode === 'signup')
const isForgot = computed(() => modal.value.mode === 'forgot')
const title = computed(() => {
  if (isForgot.value) return 'Reset your password'
  return isSignup.value ? 'Create your account' : 'Log in'
})
const submitLabel = computed(() => {
  if (busy.value) {
    if (isForgot.value) return 'Sending link…'
    return isSignup.value ? 'Creating account…' : 'Logging in…'
  }
  if (isForgot.value && cooldownLeft.value > 0) return `Resend in ${cooldownLeft.value}s`
  if (isForgot.value) return 'Send reset link'
  if (modal.value.pendingPlan) return isSignup.value ? 'Sign up & continue to checkout' : 'Log in & continue to checkout'
  return isSignup.value ? 'Create account' : 'Log in'
})

watch(
  () => modal.value.open,
  (open) => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      error.value = ''
      notice.value = ''
      password.value = ''
    }
  },
)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') closeAuth()
}

onMounted(() => {
  if (import.meta.client) window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
  stopCooldownTick()
})

function switchMode(mode: 'login' | 'signup' | 'forgot') {
  modal.value.mode = mode
  error.value = ''
  notice.value = ''
}

async function continueCheckout() {
  const plan = modal.value.pendingPlan
  closeAuth()
  if (!plan) return
  const res: any = await $fetch('/api/quota/checkout', {
    method: 'POST',
    body: { plan },
    headers: authHeaders(),
  })
  if (!res?.url) throw new Error('Checkout session did not return a URL.')
  window.open(res.url, '_blank', 'noopener,noreferrer')
}

async function onSubmit() {
  if (busy.value) return
  if (isForgot.value && cooldownLeft.value > 0) return
  error.value = ''
  notice.value = ''
  const mail = email.value.trim()
  if (!mail) {
    error.value = 'Enter your email.'
    return
  }
  if (!isForgot.value) {
    if (!password.value) {
      error.value = 'Enter your email and password.'
      return
    }
    if (password.value.length < 6) {
      error.value = 'Password must be at least 6 characters.'
      return
    }
  }
  busy.value = true
  try {
    if (isForgot.value) {
      await sendPasswordReset(mail)
      notice.value = 'We sent a reset link to this email. Check your inbox and spam folder.'
      startCooldown(60)
      return
    }
    if (isSignup.value) {
      const data = await signUp(mail, password.value)
      if (!data.session) {
        notice.value = 'Account created. Check your inbox to confirm your email, then log in to continue checkout.'
        modal.value.mode = 'login'
        return
      }
      try {
        await $fetch('/api/quota/claim-bonus', { method: 'POST', headers: authHeaders() })
      } catch {
        /* bonus is best-effort */
      }
    } else {
      await signIn(mail, password.value)
    }
    if (modal.value.pendingPlan) {
      await continueCheckout()
      return
    }
    closeAuth()
  } catch (e: any) {
    error.value = friendlyAuthError(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modal.open" class="quota-overlay" @click.self="closeAuth()">
      <div class="quota-modal auth-modal" role="dialog" aria-modal="true" :aria-labelledby="'auth-title'">
        <button class="quota-close" type="button" aria-label="Close" @click="closeAuth()">×</button>
        <p class="quota-kicker">{{ modal.pendingPlan ? 'Account required to checkout' : 'Your Slides by AI account' }}</p>
        <h2 id="auth-title">{{ title }}</h2>
        <p class="quota-copy">
          {{
            isForgot
              ? 'Enter the email on your account. We will send a link to set a new password.'
              : modal.pendingPlan
                ? 'Create an account or log in so we can attach your purchase and Pro access to you.'
                : isSignup
                  ? `Free to join. You also get ${SITE.signupBonus} extra generation as a welcome gift.`
                  : 'Welcome back. Use the email and password you signed up with.'
          }}
        </p>
        <form class="auth-form" @submit.prevent="onSubmit">
          <label>
            Email
            <input v-model="email" type="email" autocomplete="email" required placeholder="you@email.com" />
          </label>
          <label v-if="!isForgot">
            Password
            <input v-model="password" type="password" :autocomplete="isSignup ? 'new-password' : 'current-password'" required minlength="6" placeholder="At least 6 characters" />
          </label>
          <button v-if="!isSignup && !isForgot" class="auth-forgot" type="button" @click="switchMode('forgot')">
            Forgot password?
          </button>
          <p v-if="error" class="auth-error">{{ error }}</p>
          <p v-else-if="notice" class="auth-notice">{{ notice }}</p>
          <button class="quota-cta" type="submit" :disabled="busy || (isForgot && cooldownLeft > 0)">{{ submitLabel }}</button>
        </form>
        <button class="quota-later" type="button" @click="switchMode(isSignup || isForgot ? 'login' : 'signup')">
          {{ isForgot ? 'Back to log in' : isSignup ? 'Already have an account? Log in' : 'New here? Create an account' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>
