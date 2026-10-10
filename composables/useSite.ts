// Site-wide constants — single source of truth for brand & domain
export const SITE = {
  name: 'Slides by AI',
  legalName: 'Slides by AI',
  operatorType: 'individual',
  url: 'https://www.slidesbyai.com',
  tagline: 'AI Slides Generator',
  priceMonthly: 9,
  freePerDay: 1,
  paidPerMonth: 30,
  paidMaxPerDay: 10,
  freeMaxPages: 5,
  paidMaxPages: 12,
  signupBonus: 1,
  plans: {
    monthly:   { price: 9,  per: '/month',   monthsLabel: 'per month',   save: 0,  checkoutUrl: '' },
    quarterly: { price: 20, per: '/quarter', monthsLabel: 'per quarter', save: 26, checkoutUrl: '' },
    annual:    { price: 72, per: '/year',    monthsLabel: 'per year',    save: 33, checkoutUrl: '' },
  },
  supportEmail: 'support@slidesbyai.com',
  privacyEmail: 'support@slidesbyai.com',
  billingEmail: 'support@slidesbyai.com',
  paymentProcessor: 'Waffo Pancake',
  llmProvider: 'DeepSeek',
  minAge: 18,
  policiesUpdated: 'October 10, 2026',
}

export function useSite() {
  return SITE
}
