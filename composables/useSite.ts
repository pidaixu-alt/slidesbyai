// Site-wide constants — single source of truth for brand & domain
export const SITE = {
  name: 'Tagtery',
  legalName: 'Tagtery',
  operatorType: 'individual',
  url: 'https://tagtery.com',
  tagline: 'Etsy Tag Generator',
  priceMonthly: 9,
  freePerDay: 1,
  signupBonus: 1,        // extra generations gifted when a user signs up
  fairUsePerDay: 300,   // paid tier: hidden fair-use cap (anti-abuse, not shown on pricing page)
  plans: {
    monthly:   { price: 9,  per: '/month',     monthsLabel: 'per month',     save: 0,  checkoutUrl: 'https://pancake.waffo.ai/store/tagtery-1n3kl3m7/product/PROD_3vO5tmtdpI5rVLgeMnINVx?type=subscription&currency=USD' },
    quarterly: { price: 20, per: '/quarter',   monthsLabel: 'per quarter',   save: 26, checkoutUrl: 'https://pancake.waffo.ai/store/tagtery-1n3kl3m7/product/PROD_6mF7j0m59LfLzl5gYvSj10?type=subscription&currency=USD' },
    annual:    { price: 72, per: '/year',      monthsLabel: 'per year',      save: 33, checkoutUrl: 'https://pancake.waffo.ai/store/tagtery-1n3kl3m7/product/PROD_4iYdAD907eAqIhIXCx4p1A?type=subscription&currency=USD' },
  },
  supportEmail: 'support@tagtery.com',
  privacyEmail: 'privacy@tagtery.com',
  billingEmail: 'support@tagtery.com',
  paymentProcessor: 'Waffo Pancake',
  llmProvider: 'DeepSeek',
  minAge: 18,
  policiesUpdated: 'October 5, 2026',
}

export function useSite() {
  return SITE
}
