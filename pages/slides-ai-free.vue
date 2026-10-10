<script setup lang="ts">
const SITE = useSite()

useSeoMeta({
  title: `Slides AI Free — ${SITE.freePerDay} Deck per Day | ${SITE.name}`,
  description:
    'Try slides AI free: one presentation per day, editable outlines, PPTX download with watermark. No account required.',
})

const faqs = [
  {
    q: 'How many free AI slides can I make?',
    a: `${SITE.freePerDay} full presentation per calendar day per visitor, with up to ${SITE.freeMaxPages} slides each.`,
  },
  {
    q: 'Why is there a watermark on free exports?',
    a: 'The watermark keeps the free tier sustainable. Upgrade to Pro for clean PPTX files and higher monthly volume.',
  },
  {
    q: 'Do I need to sign up for slides AI free?',
    a: 'No signup for the free generator. Create an account only when you want paid plans or billing history.',
  },
] as const
</script>

<template>
  <SeoInnerPage
    h1="Slides AI free — try before you upgrade"
    intro="Get slides AI free every day: one complete deck from a topic, inline editing, and a watermarked PPTX — no credit card."
    cta-label="Start free — open generator"
    :faqs="[...faqs]"
  />
</template>
