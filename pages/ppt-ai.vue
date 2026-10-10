<script setup lang="ts">
const SITE = useSite()

useSeoMeta({
  title: `PPT AI — Generate PowerPoint Slides from a Topic | ${SITE.name}`,
  description:
    'PPT AI that outputs editable slide outlines and downloadable PowerPoint files. Try free — topic in, deck out.',
})

const faqs = [
  {
    q: 'Can PPT AI match my topic language?',
    a: 'Yes. Write your topic in the language you want; slide text follows the same language.',
  },
  {
    q: 'How many slides per deck?',
    a: `Free users get up to ${SITE.freeMaxPages} slides per generation; paid plans allow up to ${SITE.paidMaxPages} slides.`,
  },
  {
    q: 'Can I edit slides after generation?',
    a: 'Every title and bullet is editable in the browser. Re-downloading PPTX after edits does not use another generation credit.',
  },
] as const
</script>

<template>
  <SeoInnerPage
    h1="PPT AI for real PowerPoint decks"
    intro="Skip empty slide masters — enter a topic and let PPT AI draft a full outline you can tweak, then export as .pptx in minutes."
    :faqs="[...faqs]"
  />
</template>
