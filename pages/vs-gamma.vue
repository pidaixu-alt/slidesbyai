<script setup lang="ts">
const SITE = useSite()

useSeoMeta({
  title: `${SITE.name} vs Gamma — PPTX-First AI Slides`,
  description:
    'Compare Slides by AI vs Gamma: topic-to-outline workflow, editable bullets, and direct PPTX download for PowerPoint users.',
})

const faqs = [
  {
    q: 'How is Slides by AI different from Gamma?',
    a: `${SITE.name} is built around a simple loop: topic → editable slide list → PPTX download. No canvas-style web presentation required to get your file.`,
  },
  {
    q: 'Can I still use Google Slides?',
    a: 'Yes. Download PPTX and upload to Google Slides or open in PowerPoint — your deck stays in a portable format.',
  },
  {
    q: 'Which should I pick?',
    a: 'If you live in PowerPoint or want lightweight outlines with clear export, try our generator free. If you prefer Gamma’s hosted decks, use both and compare output.',
  },
] as const
</script>

<template>
  <SeoInnerPage
    h1="Slides by AI vs Gamma"
    intro="Gamma popularized AI decks in the browser; Slides by AI targets teams who want editable bullets and a PPTX file first — try our generator and compare side by side."
    cta-label="Try Slides by AI free"
    :faqs="[...faqs]"
  />
</template>
