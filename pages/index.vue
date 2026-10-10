<script setup lang="ts">
type SlidePage = { title: string; bullets: string[] }

const SITE = useSite()
const { authHeaders } = useAuth()

// ---------- generate ----------
const topic = ref('')
const loading = ref(false)
const pages = ref<SlidePage[] | null>(null)
const pptxBase64 = ref<string | null>(null)
const pagesDirty = ref(false)
const error = ref('')
const remaining = ref<number | null>(null)
const upgraded = ref(false)
const showQuotaModal = ref(false)
const downloading = ref(false)

const MAX_CHARS = 2000
const canSubmit = computed(
  () => !loading.value && topic.value.trim().length >= 5,
)

const EXAMPLE_CHIPS = [
  {
    label: 'Pitch',
    topic: 'Series A pitch deck for a B2B SaaS analytics startup targeting mid-market retailers',
  },
  {
    label: 'Lesson',
    topic: 'Introduction to photosynthesis for a middle-school science lesson',
  },
  {
    label: 'Report',
    topic: 'Q3 marketing results report for a regional coffee shop chain',
  },
] as const

function applyChip(example: string) {
  topic.value = example
}

function openQuotaModal() {
  upgraded.value = true
  showQuotaModal.value = true
}

function markDirty() {
  pagesDirty.value = true
}

function addBullet(pageIndex: number) {
  if (!pages.value) return
  pages.value[pageIndex].bullets.push('')
  markDirty()
}

function removeBullet(pageIndex: number, bulletIndex: number) {
  if (!pages.value) return
  const bullets = pages.value[pageIndex].bullets
  if (bullets.length <= 1) {
    bullets[0] = ''
  } else {
    bullets.splice(bulletIndex, 1)
  }
  markDirty()
}

async function generate() {
  if (!canSubmit.value) return
  if (remaining.value === 0) {
    openQuotaModal()
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res: any = await $fetch('/api/generate', {
      method: 'POST',
      body: { topic: topic.value },
      headers: authHeaders(),
    })
    pages.value = (res.pages || []).map((p: SlidePage) => ({
      title: p.title,
      bullets: [...(p.bullets || [])],
    }))
    pptxBase64.value = res.pptxBase64 || null
    pagesDirty.value = false
    remaining.value = res.remaining
    if (res.paid) {
      upgraded.value = false
    } else if (res.remaining <= 0) {
      openQuotaModal()
    }
    await nextTick()
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (e: any) {
    if ((e?.statusCode === 429 || e?.status === 429 || e?.data?.remaining === 0) && !e?.data?.paid) {
      remaining.value = 0
      error.value = ''
      openQuotaModal()
    } else {
      error.value = e?.data?.message || e?.message || 'Something went wrong. Please try again.'
      if (typeof e?.data?.remaining === 'number') remaining.value = e.data.remaining
    }
  } finally {
    loading.value = false
  }
}

function downloadBlob(base64: string, filename: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function downloadPptx() {
  if (!pages.value?.length || downloading.value) return
  downloading.value = true
  error.value = ''
  try {
    let base64 = pptxBase64.value
    if (pagesDirty.value || !base64) {
      const res: any = await $fetch('/api/export', {
        method: 'POST',
        body: { pages: pages.value },
        headers: authHeaders(),
      })
      base64 = res.pptxBase64
      pptxBase64.value = base64
      pagesDirty.value = false
    }
    if (!base64) {
      error.value = 'Could not build the PowerPoint file. Please try again.'
      return
    }
    downloadBlob(base64, 'slides-by-ai.pptx')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Download failed. Please try again.'
  } finally {
    downloading.value = false
  }
}

// ---------- FAQ data (also used for JSON-LD) ----------
const faqs = [
  {
    q: 'What are AI slides?',
    a: 'AI slides are presentation decks drafted by a language model from a short topic or brief. You get structured pages with titles and bullets you can edit, then download as PPTX.',
  },
  {
    q: 'How does this AI slides generator work?',
    a: 'Enter a topic, pick an example chip if you like, and generate. You get a 5–12 page outline (plan-dependent), edit titles and bullets, then download a PowerPoint file.',
  },
  {
    q: 'Is this AI slides tool free?',
    a: `Yes \u2014 ${SITE.freePerDay} free generation per day (up to ${SITE.freeMaxPages} pages, with watermark). Paid plans from $${SITE.plans.monthly.price}/month include ${SITE.paidPerMonth} presentations/month and remove the watermark.`,
  },
  {
    q: 'Can I edit the slides before downloading?',
    a: 'Yes. Every slide title and bullet is editable in the browser. After you change text, Download rebuilds the PPTX from your edits without using another generation credit.',
  },
  {
    q: 'What file format do I get?',
    a: 'A standard .pptx file you can open in PowerPoint, Google Slides, Keynote, and most other presentation apps.',
  },
  {
    q: 'How many pages does each deck include?',
    a: `Free runs are capped at ${SITE.freeMaxPages} pages. Paid plans allow up to ${SITE.paidMaxPages} pages per presentation.`,
  },
  {
    q: 'Do free downloads include a watermark?',
    a: 'Yes. Free exports add a final watermark slide. Paid plans remove it.',
  },
  {
    q: 'What topics work best?',
    a: 'Be specific: audience, goal, and context. Pitch, lesson, and report chips are good starting points for AI slides that stay focused.',
  },
]

// ---------- JSON-LD ----------
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Slides by AI',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: SITE.url,
        description:
          'Generate editable AI slides from a topic and download PPTX. Free daily trial; paid plans for more presentations.',
        offers: { '@type': 'Offer', price: '9.00', priceCurrency: 'USD' },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.slice(0, 4).map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }),
    },
  ],
})

useSeoMeta({
  title: 'AI Slides Generator — Topic to Editable PPTX (Free)',
  description:
    'Create AI slides from a topic in seconds. Edit titles and bullets, then download PPTX. Free daily trial — no signup required.',
  ogTitle: 'AI Slides Generator — Topic to Editable PPTX',
  ogDescription:
    'Create AI slides from a topic in seconds. Edit titles and bullets, then download PPTX. Free daily trial — no signup required.',
})
</script>

<template>
  <div class="wrap">
    <SiteHeader home />

    <!-- Hero + Tool -->
    <section class="hero">
      <h1>Slides by AI</h1>
      <p class="sub">
        Turn a topic into editable AI slides and download a PowerPoint deck in minutes.
        Free to try — no signup required.
      </p>

      <div class="tool-card">
        <textarea
          v-model="topic"
          :maxlength="MAX_CHARS"
          placeholder="Describe your presentation… e.g. Q3 marketing plan for a coffee shop, or a 20-minute lesson on climate change for grade 8."
        />
        <div class="chip-row" role="group" aria-label="Example topics">
          <button
            v-for="chip in EXAMPLE_CHIPS"
            :key="chip.label"
            type="button"
            class="chip-btn"
            @click="applyChip(chip.topic)"
          >
            {{ chip.label }}
          </button>
        </div>
        <div class="tool-row">
          <span class="char-count">{{ topic.length }} / {{ MAX_CHARS }}</span>
          <button class="btn-primary" :disabled="!canSubmit" @click="generate">
            <span v-if="!loading">Generate Slides →</span>
            <span v-else>Generating…</span>
          </button>
        </div>
        <div v-if="error" class="error-msg">{{ error }}</div>
      </div>
    </section>

    <!-- Results -->
    <section v-if="pages" id="results" class="result-section">
      <div class="result-head">
        <h2>Your {{ pages.length }} Slides</h2>
        <span class="remaining">
          <template v-if="remaining !== null && remaining > 0">
            {{ remaining }} free {{ remaining === 1 ? 'generation' : 'generations' }} left today
          </template>
          <template v-else-if="upgraded">
            Daily free limit used —
            <button class="text-link" type="button" @click="openQuotaModal">get extra generations</button>
          </template>
        </span>
      </div>

      <div class="slides-list">
        <div v-for="(page, pi) in pages" :key="'page' + pi" class="slide-card">
          <div class="slide-label">Slide {{ pi + 1 }}</div>
          <input
            v-model="page.title"
            class="slide-title-input"
            type="text"
            :aria-label="'Title for slide ' + (pi + 1)"
            @input="markDirty"
          />
          <ul class="slide-bullets">
            <li v-for="(_b, bi) in page.bullets" :key="'b' + pi + '-' + bi">
              <input
                v-model="page.bullets[bi]"
                class="slide-bullet-input"
                type="text"
                :aria-label="'Bullet ' + (bi + 1) + ' on slide ' + (pi + 1)"
                @input="markDirty"
              />
              <button
                type="button"
                class="bullet-remove"
                :aria-label="'Remove bullet ' + (bi + 1)"
                @click="removeBullet(pi, bi)"
              >
                ×
              </button>
            </li>
          </ul>
          <button type="button" class="text-link add-bullet" @click="addBullet(pi)">
            + Add bullet
          </button>
        </div>
      </div>

      <button class="copy-all-btn" :disabled="downloading" @click="downloadPptx">
        {{ downloading ? 'Preparing download…' : 'Download PPTX' }}
      </button>
    </section>

    <!-- How it works -->
    <section class="section">
      <h2>How AI slides work</h2>
      <div class="steps">
        <div class="step">
          <span class="num">1</span>
          <h3>Describe</h3>
          <p>Enter a topic or tap Pitch / Lesson / Report for a ready-made example.</p>
        </div>
        <div class="step">
          <span class="num">2</span>
          <h3>Generate</h3>
          <p>Get a structured deck with titles and bullets you can edit in place.</p>
        </div>
        <div class="step">
          <span class="num">3</span>
          <h3>Download</h3>
          <p>Export a PPTX file for PowerPoint, Google Slides, or Keynote.</p>
        </div>
      </div>
    </section>

    <!-- Specifics -->
    <section class="section">
      <h2>The specifics</h2>
      <p class="sub">Everything on the table — no surprises.</p>
      <table class="spec-table">
        <tbody>
          <tr><th>Output per generation</th><td>Editable slide outline + PPTX download</td></tr>
          <tr><th>Page limits</th><td>Free ≤ {{ SITE.freeMaxPages }} pages · Paid ≤ {{ SITE.paidMaxPages }} pages</td></tr>
          <tr><th>Free plan</th><td>{{ SITE.freePerDay }} generation per day, watermark on export, no signup</td></tr>
          <tr><th>Paid plans</th><td>From ${{ SITE.plans.monthly.price }}/month — {{ SITE.paidPerMonth }} presentations/month, no watermark (annual saves {{ SITE.plans.annual.save }}%)</td></tr>
          <tr><th>Edits</th><td>Change titles and bullets anytime; re-export does not use another credit</td></tr>
          <tr><th>Language</th><td>Matches your topic language</td></tr>
          <tr><th>Install required</th><td>None — works in any browser, desktop and mobile</td></tr>
        </tbody>
      </table>
    </section>

    <!-- FAQ -->
    <section class="section">
      <h2>Frequently asked questions</h2>
      <div class="faq-list">
        <details v-for="(f, i) in faqs" :key="i" class="faq-item" :open="i < 2">
          <summary>{{ f.q }}</summary>
          <p class="faq-a">{{ f.a }}</p>
        </details>
      </div>
    </section>

    <QuotaModal :open="showQuotaModal" @close="showQuotaModal = false" />

    <SiteFooter />
  </div>
</template>
