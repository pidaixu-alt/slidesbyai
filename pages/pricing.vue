<script setup lang="ts">
const SITE = useSite()
type PaidPlan = 'monthly' | 'quarterly' | 'annual'

const selected = ref<PaidPlan>('annual')
const checkoutBusy = ref(false)
const { user, openAuth, authHeaders } = useAuth()

useSeoMeta({
  title: `Pricing — ${SITE.name} Pro (from $${SITE.plans.monthly.price}/month)`,
  description: `${SITE.paidPerMonth} AI presentations per month from $${SITE.plans.monthly.price}/month — save up to ${SITE.plans.annual.save}% with an annual plan. Free plan: ${SITE.freePerDay}/day with watermark.`,
})

function selectPlan(plan: PaidPlan) {
  if (checkoutBusy.value) return
  selected.value = plan
}

function ctaLabel(plan: PaidPlan) {
  if (checkoutBusy.value && selected.value === plan) return 'Redirecting…'
  if (selected.value === plan) return user.value ? 'Continue to checkout' : 'Log in to checkout'
  if (plan === 'monthly') return 'Choose Monthly'
  if (plan === 'quarterly') return 'Choose Quarterly'
  return 'Choose Annual'
}

async function goCheckout(plan: PaidPlan) {
  checkoutBusy.value = true
  try {
    const res: any = await $fetch('/api/quota/checkout', {
      method: 'POST',
      body: { plan },
      headers: authHeaders(),
    })
    if (!res?.url) throw new Error('Checkout session did not return a URL.')
    window.open(res.url, '_blank', 'noopener,noreferrer')
  } catch (e: any) {
    if (e?.statusCode === 401 || e?.status === 401) {
      openAuth('signup', plan)
      return
    }
    errorNotice.value = e?.data?.message || e?.message || 'Could not start checkout. Please try again.'
  } finally {
    checkoutBusy.value = false
  }
}

const errorNotice = ref('')

async function onPaidCta(plan: PaidPlan) {
  if (checkoutBusy.value) return
  errorNotice.value = ''
  if (selected.value !== plan) {
    selected.value = plan
    return
  }
  if (!user.value) {
    openAuth('signup', plan)
    return
  }
  await goCheckout(plan)
}

const paidBullets = [
  `${SITE.paidPerMonth} presentations per month`,
  `Up to ${SITE.paidMaxPages} slides per deck`,
  'No watermark · PPTX download',
  'Generation history',
  'Priority support',
  'Cancel anytime',
] as const
</script>

<template>
  <div class="wrap wrap--wide">
    <SiteHeader />

    <section class="hero">
      <h1>Simple pricing</h1>
      <p class="sub">
        Start free. Upgrade when you need more decks. Save up to {{ SITE.plans.annual.save }}% with a longer plan.
      </p>
      <p v-if="errorNotice" class="error-msg" style="margin-top: 18px; text-align: left">{{ errorNotice }}</p>
    </section>

    <div class="price-grid price-grid-4">
      <div class="price-card">
        <h3>Free</h3>
        <div class="price-num">$0</div>
        <ul>
          <li>{{ SITE.freePerDay }} presentation per day</li>
          <li>Up to {{ SITE.freeMaxPages }} slides per deck</li>
          <li>Watermark on exports</li>
          <li>No signup required</li>
        </ul>
        <NuxtLink to="/" class="price-cta free">Try the generator</NuxtLink>
      </div>

      <div
        class="price-card paid"
        :class="{ 'is-selected': selected === 'monthly' }"
        @click="selectPlan('monthly')"
      >
        <h3>Monthly</h3>
        <div class="price-num">${{ SITE.plans.monthly.price }}</div>
        <div class="price-period">per month</div>
        <ul>
          <li v-for="item in paidBullets" :key="item">{{ item }}</li>
        </ul>
        <button
          class="price-cta"
          :class="selected === 'monthly' ? 'pro' : 'ghost'"
          type="button"
          :disabled="checkoutBusy"
          @click.stop="onPaidCta('monthly')"
        >
          {{ ctaLabel('monthly') }}
        </button>
      </div>

      <div
        class="price-card paid"
        :class="{ 'is-selected': selected === 'quarterly' }"
        @click="selectPlan('quarterly')"
      >
        <h3>Quarterly</h3>
        <div class="price-num">${{ SITE.plans.quarterly.price }}</div>
        <div class="price-period">per quarter</div>
        <ul>
          <li v-for="item in paidBullets" :key="item">{{ item }}</li>
          <li>Equivalent to $6.67/month — save {{ SITE.plans.quarterly.save }}%</li>
        </ul>
        <button
          class="price-cta"
          :class="selected === 'quarterly' ? 'pro' : 'ghost'"
          type="button"
          :disabled="checkoutBusy"
          @click.stop="onPaidCta('quarterly')"
        >
          {{ ctaLabel('quarterly') }}
        </button>
      </div>

      <div
        class="price-card paid"
        :class="{ 'is-selected': selected === 'annual' }"
        @click="selectPlan('annual')"
      >
        <span class="badge">Best value</span>
        <h3>Annual</h3>
        <div class="price-num">${{ SITE.plans.annual.price }}</div>
        <div class="price-period">per year</div>
        <ul>
          <li v-for="item in paidBullets" :key="item">{{ item }}</li>
          <li>Equivalent to $6/month — save {{ SITE.plans.annual.save }}%</li>
        </ul>
        <button
          class="price-cta"
          :class="selected === 'annual' ? 'pro' : 'ghost'"
          type="button"
          :disabled="checkoutBusy"
          @click.stop="onPaidCta('annual')"
        >
          {{ ctaLabel('annual') }}
        </button>
      </div>
    </div>

    <section class="section">
      <h2>Pricing FAQ</h2>
      <div class="faq-list">
        <details class="faq-item" open>
          <summary>Is the free plan really free?</summary>
          <p class="faq-a">
            Yes. {{ SITE.freePerDay }} presentation every day, up to {{ SITE.freeMaxPages }} slides per deck,
            with a watermark — forever, no signup or credit card. Upgrade for {{ SITE.paidPerMonth }}
            presentations per month, PPTX without watermark, and up to {{ SITE.paidMaxPages }} slides per deck.
          </p>
        </details>
        <details class="faq-item">
          <summary>Which paid plan should I choose?</summary>
          <p class="faq-a">
            All paid plans include the same quota — {{ SITE.paidPerMonth }} presentations per month. The only
            difference is how long you commit and how much you save: Monthly is ${{ SITE.plans.monthly.price }}/month,
            Quarterly is ${{ SITE.plans.quarterly.price }} (save {{ SITE.plans.quarterly.save }}%), and Annual is
            ${{ SITE.plans.annual.price }} (save {{ SITE.plans.annual.save }}%). If you create decks regularly,
            Annual is the best value.
          </p>
        </details>
        <details class="faq-item">
          <summary>Is there a daily limit on Pro?</summary>
          <p class="faq-a">
            Paid plans include {{ SITE.paidPerMonth }} presentations per calendar month. To prevent automated
            abuse, we also apply a fair-use cap of {{ SITE.paidMaxPerDay }} generations per day per account.
            Normal use stays well below this cap.
          </p>
        </details>
        <details class="faq-item">
          <summary>Can I cancel anytime?</summary>
          <p class="faq-a">
            Yes. Cancel in your billing portal or email {{ SITE.supportEmail }}. You keep Pro
            until the end of the paid period. No further charges after that.
          </p>
        </details>
        <details class="faq-item">
          <summary>What is the refund policy?</summary>
          <p class="faq-a">
            First Pro charge: full refund within 7 days. Duplicate charges are refunded.
            Email {{ SITE.billingEmail }} with your transaction ID. Card payments are processed
            by {{ SITE.paymentProcessor }}; we never store your full card number. Full terms:
            <NuxtLink to="/legal/terms">Terms of Service</NuxtLink>.
          </p>
        </details>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>
