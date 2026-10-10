<script setup lang="ts">
const SITE = useSite()
const { authHeaders } = useAuth()

// ---------- generate ----------
const description = ref('')
const loading = ref(false)
const result = ref<{ tags: string[]; titles: string[] } | null>(null)
const error = ref('')
const remaining = ref<number | null>(null)
const upgraded = ref(false)
const showQuotaModal = ref(false)

const MAX_CHARS = 2000
const canSubmit = computed(
  () => !loading.value && description.value.trim().length >= 10,
)

function openQuotaModal() {
  upgraded.value = true
  showQuotaModal.value = true
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
      body: { description: description.value },
      headers: authHeaders(),
    })
    result.value = { tags: res.tags, titles: res.titles }
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

// ---------- copy ----------
const copiedRef = ref('') // which element was just copied

async function copy(text: string, id: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedRef.value = id
    setTimeout(() => (copiedRef.value = ''), 1500)
  } catch {
    /* clipboard unavailable */
  }
}

function copyAll() {
  if (!result.value) return
  const tags = result.value.tags.map((t) => t).join(', ')
  const titles = result.value.titles
    .map((t, i) => `Title ${i + 1}: ${t}`)
    .join('\n')
  copy(`TAGS (${result.value.tags.length}):\n${tags}\n\nTITLES:\n${titles}`, 'all')
}

// ---------- FAQ data (also used for JSON-LD) ----------
const faqs = [
  {
    q: 'How many tags should I use on Etsy?',
    a: "Use all 13 tags Etsy allows. Most sellers only add a few, so filling all 13 with long-tail phrases is one of the easiest ways to outrank competitors.",
  },
  {
    q: 'What makes a good Etsy tag?',
    a: "Specific, long-tail phrases beat broad keywords. \u201cpersonalized dog mom mug\u201d will bring more relevant shoppers than \u201cmug\u201d. Mix category, material, style, and occasion terms.",
  },
  {
    q: 'How does this Etsy tag generator work?',
    a: 'Paste your product description and it generates 13 tags and 5 title options that follow Etsy\u2019s character limits. No keyword research or SEO knowledge needed.',
  },
  {
    q: 'Is this Etsy tag generator free?',
    a: `Yes \u2014 ${SITE.freePerDay} free generation per day, no signup required. Paid plans from $${SITE.plans.monthly.price}/month remove the limit and add history.`,
  },
  {
    q: 'Can I copy these tags directly into my Etsy listing?',
    a: 'Yes. Every tag is under Etsy\u2019s 20-character limit and every title under 140 characters, so you can paste them straight into your listing.',
  },
  {
    q: 'Does it work for my category? (digital downloads, jewelry, candles\u2026)',
    a: 'Yes, it works for all Etsy categories. The more detail you paste (materials, occasion, style, who it\u2019s for), the better the tags.',
  },
  {
    q: 'What\u2019s the difference between Etsy tags and attributes?',
    a: 'Tags are 13 keyword slots you choose; attributes are fixed dropdowns like color and occasion set by Etsy. Both count toward search \u2014 use both.',
  },
  {
    q: 'How long can Etsy titles be?',
    a: '140 characters. Front-load your most important keywords in the first 40 \u2014 that\u2019s what shows in search results on mobile.',
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
        name: 'Etsy Tag Generator',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: SITE.url,
        description:
          'Generate 13 ready-to-use Etsy tags and 5 optimized listing titles from your product description.',
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
  title: 'Etsy Tag Generator — 13 Ready-to-Use Tags & 5 Titles (Free)',
  description:
    'Paste your product description and instantly get 13 ready-to-use Etsy tags and 5 optimized titles. Free, no signup. Works for all categories.',
  ogTitle: 'Etsy Tag Generator — 13 Ready-to-Use Tags & 5 Titles',
  ogDescription:
    'Paste your product description and instantly get 13 ready-to-use Etsy tags and 5 optimized titles. Free, no signup.',
})
</script>

<template>
  <div class="wrap">
    <SiteHeader home />

    <!-- Hero + Tool -->
    <section class="hero">
      <h1>Etsy Tag Generator</h1>
      <p class="sub">
        Get 13 ready-to-use tags and 5 optimized titles for your listing in seconds.
        Just paste your product description — no keyword research, no signup.
      </p>

      <div class="tool-card">
        <textarea
          v-model="description"
          :maxlength="MAX_CHARS"
          placeholder="Paste your product description here… e.g. Handmade soy wax candle, lavender &amp; vanilla scent, poured in a reusable amber glass jar, 40h burn time, perfect as a gift for mom or housewarming."
        />
        <div class="tool-row">
          <span class="char-count">{{ description.length }} / {{ MAX_CHARS }}</span>
          <button class="btn-primary" :disabled="!canSubmit" @click="generate">
            <span v-if="!loading">Generate Tags →</span>
            <span v-else>Generating…</span>
          </button>
        </div>
        <div v-if="error" class="error-msg">{{ error }}</div>
      </div>
    </section>

    <!-- Results -->
    <section v-if="result" id="results" class="result-section">
      <div class="result-head">
        <h2>Your {{ result.tags.length }} Tags</h2>
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

      <div class="tags-grid">
        <span v-for="(t, i) in result.tags" :key="'tag' + i" class="tag-pill">
          {{ t }} <span class="len">{{ t.length }}/20</span>
        </span>
      </div>

      <div class="result-head" style="margin-top: 34px">
        <h2>Your {{ result.titles.length }} Title Options</h2>
      </div>
      <div class="titles-list">
        <div v-for="(t, i) in result.titles" :key="'title' + i" class="title-card">
          <p>{{ t }}</p>
          <div class="title-meta">
            <span>{{ t.length }}/140 characters</span>
            <button
              class="copy-btn"
              :class="{ copied: copiedRef === 'title' + i }"
              @click="copy(t, 'title' + i)"
            >
              {{ copiedRef === 'title' + i ? 'Copied ✓' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>

      <button class="copy-all-btn" @click="copyAll">
        {{ copiedRef === 'all' ? 'Everything copied to clipboard ✓' : 'Copy all tags + titles' }}
      </button>
    </section>

    <!-- How it works -->
    <section class="section">
      <h2>How it works</h2>
      <div class="steps">
        <div class="step">
          <span class="num">1</span>
          <h3>Paste</h3>
          <p>Copy your product description or draft listing text into the box above.</p>
        </div>
        <div class="step">
          <span class="num">2</span>
          <h3>Generate</h3>
          <p>Get 13 tags (max 20 characters each, per Etsy's limit) and 5 title options (max 140 characters each).</p>
        </div>
        <div class="step">
          <span class="num">3</span>
          <h3>Copy</h3>
          <p>Paste them directly into your Etsy listing. Done in 30 seconds.</p>
        </div>
      </div>
    </section>

    <!-- Specifics -->
    <section class="section">
      <h2>The specifics</h2>
      <p class="sub">Everything on the table — no surprises.</p>
      <table class="spec-table">
        <tbody>
          <tr><th>Output per generation</th><td>13 tags + 5 title options, in one click</td></tr>
          <tr><th>Character limits</th><td>Tags ≤ 20 chars · Titles ≤ 140 chars (matches Etsy's rules)</td></tr>
          <tr><th>Categories</th><td>All of them — digital downloads, jewelry, candles, clothing, art, printables…</td></tr>
          <tr><th>Free plan</th><td>{{ SITE.freePerDay }} generation per day, no signup required</td></tr>
          <tr><th>Paid plans</th><td>From ${{ SITE.plans.monthly.price }}/month — unlimited generations + history (annual saves {{ SITE.plans.annual.save }}%)</td></tr>
          <tr><th>Language</th><td>English (Etsy search is English-first)</td></tr>
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

    <SiteFooter show-etsy-disclaimer />
  </div>
</template>
