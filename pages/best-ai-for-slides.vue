<script setup lang="ts">
const SITE = useSite()

useSeoMeta({
  title: `Best AI for Slides — Editable Outlines + PPTX | ${SITE.name}`,
  description:
    'Looking for the best AI for slides? Compare workflow: topic → editable deck → PPTX download, with clear free and paid limits.',
})

const faqs = [
  {
    q: 'What makes good AI for slides?',
    a: 'You want structured titles and bullets you can edit, standard PPTX export, and transparent limits — not locked-in proprietary formats.',
  },
  {
    q: 'Does this replace a designer?',
    a: `${SITE.name} focuses on content structure and speaker-ready outlines. You still control wording, order, and final polish.`,
  },
  {
    q: 'How is pricing structured?',
    a: `Free: ${SITE.freePerDay}/day with watermark. Pro from $${SITE.plans.monthly.price}/month includes ${SITE.paidPerMonth} presentations and no watermark. See pricing for quarterly and annual savings.`,
  },
] as const
</script>

<template>
  <SeoInnerPage
    h1="Best AI for slides when you need PPTX"
    intro="The best AI for slides should give you an editable outline and a file you own — not a walled garden. Start with a topic and export PowerPoint-ready slides."
    :faqs="[...faqs]"
  />
</template>
