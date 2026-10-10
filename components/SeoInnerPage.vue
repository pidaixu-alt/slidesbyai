<script setup lang="ts">
export type SeoFaq = { q: string; a: string }

defineProps<{
  h1: string
  intro: string
  faqs: SeoFaq[]
  ctaLabel?: string
}>()
</script>

<template>
  <div class="wrap">
    <SiteHeader />

    <section class="hero">
      <h1>{{ h1 }}</h1>
      <p class="sub">{{ intro }}</p>
      <p style="margin-top: 22px">
        <NuxtLink to="/" class="price-cta pro" style="display: inline-block; min-width: 220px">
          {{ ctaLabel ?? 'Try the free generator' }}
        </NuxtLink>
      </p>
    </section>

    <section class="section">
      <h2>Frequently asked questions</h2>
      <div class="faq-list">
        <details v-for="(f, i) in faqs" :key="i" class="faq-item" :open="i === 0">
          <summary>{{ f.q }}</summary>
          <p class="faq-a">{{ f.a }}</p>
        </details>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
