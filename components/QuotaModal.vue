<script setup lang="ts">
const SITE = useSite()
const { openAuth } = useAuth()

const bonusWord = computed(() => (SITE.signupBonus === 1 ? 'generation' : 'generations'))

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function signUp() {
  emit('close')
  openAuth('signup')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
)

onUnmounted(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="quota-overlay" @click.self="emit('close')">
      <div class="quota-modal" role="dialog" aria-modal="true" aria-labelledby="quota-title">
        <button class="quota-close" type="button" aria-label="Close" @click="emit('close')">×</button>
        <p class="quota-kicker">Daily free limit reached</p>
        <h2 id="quota-title">Sign up and get {{ SITE.signupBonus }} extra {{ bonusWord }}</h2>
        <p class="quota-copy">
          You’ve used today’s free generation. Create an account now and we’ll gift you
          <strong>{{ SITE.signupBonus }} extra {{ bonusWord }}</strong> so you can keep going —
          no extra charge for the welcome gift. Or go Pro for unlimited tags and titles.
        </p>
        <button class="quota-cta" type="button" @click="signUp">
          Sign up &amp; get +{{ SITE.signupBonus }} {{ bonusWord }} →
        </button>
        <button class="quota-later" type="button" @click="emit('close')">Maybe later</button>
      </div>
    </div>
  </Teleport>
</template>
