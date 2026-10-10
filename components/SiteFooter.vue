<script setup lang="ts">
const SITE = useSite()
const year = new Date().getFullYear()

withDefaults(
  defineProps<{
    showEtsyDisclaimer?: boolean
  }>(),
  { showEtsyDisclaimer: false },
)
</script>

<template>
  <footer class="site-footer">
    <div class="inner">
      <span>© {{ year }} {{ SITE.name }}</span>
      <span>
        <NuxtLink to="/">Generator</NuxtLink>
        <NuxtLink to="/pricing">Pricing</NuxtLink>
        <NuxtLink to="/legal/privacy">Privacy</NuxtLink>
        <NuxtLink to="/legal/terms">Terms</NuxtLink>
      </span>
    </div>
    <p class="footer-contact">
      Support:
      <a :href="'mailto:' + SITE.supportEmail">{{ SITE.supportEmail }}</a>
    </p>
    <p v-if="showEtsyDisclaimer" class="footer-note">
      {{ SITE.name }} is an independent tool and is not affiliated with, endorsed by, or sponsored by Etsy, Inc.
    </p>
  </footer>
</template>
