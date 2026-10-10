import type { Session, User } from '@supabase/supabase-js'

export type AuthMode = 'login' | 'signup' | 'forgot'
export type PaidPlan = 'monthly' | 'quarterly' | 'annual'

type AuthModalState = {
  open: boolean
  mode: AuthMode
  pendingPlan: PaidPlan | null
}

export function useAuth() {
  const session = useState<Session | null>('auth-session', () => null)
  const ready = useState('auth-ready', () => false)
  const modal = useState<AuthModalState>('auth-modal', () => ({
    open: false,
    mode: 'login',
    pendingPlan: null,
  }))

  const user = computed(() => session.value?.user || null)
  const email = computed(() => user.value?.email || '')
  const accessToken = computed(() => session.value?.access_token || '')

  async function init() {
    if (!import.meta.client) return
    const supabase = useSupabase()
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    ready.value = true
    supabase.auth.onAuthStateChange((event, next) => {
      session.value = next
      if (event === 'PASSWORD_RECOVERY' && window.location.pathname !== '/reset-password') {
        navigateTo('/reset-password')
      }
    })
  }

  function openAuth(mode: AuthMode = 'login', pendingPlan: PaidPlan | null = null) {
    modal.value = { open: true, mode, pendingPlan }
  }

  function closeAuth() {
    modal.value = { ...modal.value, open: false }
  }

  async function signIn(emailValue: string, password: string) {
    const { data, error } = await useSupabase().auth.signInWithPassword({
      email: emailValue.trim(),
      password,
    })
    if (error) throw error
    session.value = data.session
    return data.user as User
  }

  async function signUp(emailValue: string, password: string) {
    const { data, error } = await useSupabase().auth.signUp({
      email: emailValue.trim(),
      password,
    })
    if (error) throw error
    if (data.session) session.value = data.session
    return data
  }

  async function signOut() {
    await useSupabase().auth.signOut()
    session.value = null
  }

  async function sendPasswordReset(emailValue: string) {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { email: emailValue.trim() },
    })
  }

  async function updatePassword(password: string) {
    const { error } = await useSupabase().auth.updateUser({ password })
    if (error) throw error
  }

  function authHeaders() {
    const token = accessToken.value
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  return {
    session,
    user,
    email,
    ready,
    modal,
    accessToken,
    init,
    openAuth,
    closeAuth,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
    authHeaders,
  }
}
