<script setup lang="ts">
const SITE = useSite()

useSeoMeta({
  title: `Free AI Slides Generator — Topic to Deck | ${SITE.name}`,
  description:
    'Free AI slides generator: type a topic, edit titles and bullets, download PPTX. One free generation per day.',
})

const faqs = [
  {
    q: 'Is this AI slides generator really free?',
    a: `Yes — ${SITE.freePerDay} generation every day with up to ${SITE.freeMaxPages} slides. No signup required on the free path.`,
  },
  {
    q: 'What file format do I get?',
    a: 'A standard PPTX presentation you can open in PowerPoint, upload to Google Slides, or use in Keynote.',
  },
  {
    q: 'What happens when I hit the daily limit?',
    a: 'You can return tomorrow for another free deck, or upgrade for more presentations per month and larger slide counts.',
  },
] as const
</script>

<template>
  <SeoInnerPage
    h1="Free AI slides generator"
    intro="Our free AI slides generator turns a short topic into a full deck outline — edit every slide, then download PPTX without installing anything."
    cta-label="Open the free AI slides generator"
    :faqs="[...faqs]"
  />
</template>
