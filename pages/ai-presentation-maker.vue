<script setup lang="ts">
const SITE = useSite()

useSeoMeta({
  title: `AI Presentation Maker — Topic to PPTX | ${SITE.name}`,
  description:
    'Use our AI presentation maker to turn a topic into editable slides and download PPTX. Free daily trial — no signup required.',
})

const faqs = [
  {
    q: 'What is an AI presentation maker?',
    a: `${SITE.name} reads your topic and builds a structured deck with slide titles and bullet points you can edit before export.`,
  },
  {
    q: 'Do I need PowerPoint installed?',
    a: 'No. Generate in your browser and download a standard PPTX file for PowerPoint, Google Slides, or Keynote.',
  },
  {
    q: 'Is there a free plan?',
    a: `Yes — ${SITE.freePerDay} presentation per day, up to ${SITE.freeMaxPages} slides, with a watermark. Paid plans add ${SITE.paidPerMonth} decks per month and remove the watermark.`,
  },
] as const
</script>

<template>
  <SeoInnerPage
    h1="AI presentation maker"
    intro="Describe your talk once and get editable AI slides with titles, bullets, and a PPTX download — built for real decks, not blank templates."
    :faqs="[...faqs]"
  />
</template>
