<script setup lang="ts">
const SITE = useSite()
const { user, email, ready, openAuth, signOut } = useAuth()

withDefaults(
  defineProps<{
    home?: boolean
    hideAuth?: boolean
  }>(),
  { home: false, hideAuth: false },
)

const shortEmail = computed(() => {
  const value = email.value
  if (value.length <= 22) return value
  return value.slice(0, 18) + '…'
})
</script>

<template>
  <header class="site-header">
    <NuxtLink class="logo" to="/">{{ SITE.name }}<span>.</span></NuxtLink>
    <nav class="nav-bar">
      <NuxtLink v-if="home" class="nav-link" to="/pricing">Pricing</NuxtLink>
      <NuxtLink v-else class="nav-link" to="/">← Generator</NuxtLink>
      <template v-if="!hideAuth && ready && user">
        <span class="nav-email" :title="email">{{ shortEmail }}</span>
        <button class="nav-text-btn" type="button" @click="signOut">Log out</button>
      </template>
      <template v-else-if="!hideAuth">
        <button class="nav-text-btn" type="button" @click="openAuth('login')">Log in</button>
        <button class="nav-signup-btn" type="button" @click="openAuth('signup')">Sign up</button>
      </template>
    </nav>
  </header>
</template>
