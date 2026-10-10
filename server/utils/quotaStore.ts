import type { PlanKey } from './quotaShared'
import {
  remainingPaid,
  monthKey,
  paidMonthlyLimit,
  paidMaxPerDayLimit,
} from './quotaShared'

export type QuotaRow = {
  ip_hash: string
  bonus_credits: number
  bonus_claimed_at: string | null
  plan: PlanKey
  plan_expires_at: string | null
  email: string | null
  waffo_customer_id: string | null
  waffo_subscription_id: string | null
}

const memQuota = new Map<string, QuotaRow>()
/** key: `${subject}:${todayKey()}` or `${subject}:${monthKey()}` */
const memUsed = new Map<string, number>()
const memIntents: { ip_hash: string; plan: string; created_at: number; consumed: boolean; email: string | null }[] = []
const memEvents = new Set<string>()

function emptyQuota(ipHash: string): QuotaRow {
  return {
    ip_hash: ipHash,
    bonus_credits: 0,
    bonus_claimed_at: null,
    plan: 'free',
    plan_expires_at: null,
    email: null,
    waffo_customer_id: null,
    waffo_subscription_id: null,
  }
}

export function isPaid(row: QuotaRow): boolean {
  if (row.plan === 'free') return false
  if (!row.plan_expires_at) return true
  return new Date(row.plan_expires_at).getTime() > Date.now()
}

export async function countToday(ipHash: string): Promise<number> {
  if (supabaseConfigured()) {
    const startOfDay = todayKey() + 'T00:00:00.000Z'
    const rows: any[] = await sbFetch(
      `/rest/v1/aislides_generations?ip_hash=eq.${ipHash}&created_at=gte.${startOfDay}&select=id`,
    )
    return Array.isArray(rows) ? rows.length : 0
  }
  return memUsed.get(`${ipHash}:${todayKey()}`) || 0
}

/** Calendar-month UTC count; prefer email subject when provided. */
export async function countMonth(subject: string): Promise<number> {
  const mk = monthKey()
  if (supabaseConfigured()) {
    const startOfMonth = `${mk}-01T00:00:00.000Z`
    const isEmail = subject.includes('@')
    const filter = isEmail
      ? `email=eq.${encodeURIComponent(subject)}`
      : `ip_hash=eq.${encodeURIComponent(subject)}`
    const rows: any[] = await sbFetch(
      `/rest/v1/aislides_generations?${filter}&created_at=gte.${startOfMonth}&select=id`,
    )
    return Array.isArray(rows) ? rows.length : 0
  }
  return memUsed.get(`${subject}:${mk}`) || 0
}

/** Day for free; calendar month UTC for paid (prefer email when paid). */
export async function countUsage(
  ipHash: string,
  email: string | null | undefined,
  paid: boolean,
): Promise<number> {
  if (paid) {
    const subject = (email && email.trim()) || ipHash
    return countMonth(subject)
  }
  return countToday(ipHash)
}

export async function recordGeneration(
  ipHash: string,
  result: unknown,
  email?: string | null,
) {
  if (supabaseConfigured()) {
    const body: Record<string, unknown> = { ip_hash: ipHash, result }
    if (email) body.email = email
    try {
      await sbFetch('/rest/v1/aislides_generations', {
        method: 'POST',
        body,
      })
    } catch {
      // email column may be missing on older DBs — retry without it
      await sbFetch('/rest/v1/aislides_generations', {
        method: 'POST',
        body: { ip_hash: ipHash, result },
      })
    }
    return
  }
  const dayKey = `${ipHash}:${todayKey()}`
  memUsed.set(dayKey, (memUsed.get(dayKey) || 0) + 1)
  const subject = (email && email.trim()) || ipHash
  const mk = `${subject}:${monthKey()}`
  memUsed.set(mk, (memUsed.get(mk) || 0) + 1)
}

async function ensureQuotaRow(ipHash: string): Promise<QuotaRow> {
  if (supabaseConfigured()) {
    const rows: any[] = await sbFetch(`/rest/v1/aislides_quotas?ip_hash=eq.${ipHash}&select=*`)
    if (Array.isArray(rows) && rows[0]) return rows[0] as QuotaRow
    const created: any[] = await sbFetch('/rest/v1/aislides_quotas', {
      method: 'POST',
      body: { ip_hash: ipHash, bonus_credits: 0, plan: 'free' },
    })
    return (created?.[0] as QuotaRow) || emptyQuota(ipHash)
  }
  if (!memQuota.has(ipHash)) memQuota.set(ipHash, emptyQuota(ipHash))
  return memQuota.get(ipHash)!
}

async function saveQuota(row: QuotaRow) {
  if (supabaseConfigured()) {
    await sbFetch(`/rest/v1/aislides_quotas?ip_hash=eq.${row.ip_hash}`, {
      method: 'PATCH',
      body: {
        bonus_credits: row.bonus_credits,
        bonus_claimed_at: row.bonus_claimed_at,
        plan: row.plan,
        plan_expires_at: row.plan_expires_at,
        email: row.email,
        waffo_customer_id: row.waffo_customer_id,
        waffo_subscription_id: row.waffo_subscription_id,
      },
    })
    return
  }
  memQuota.set(row.ip_hash, row)
}

export async function getQuotaState(ipHash: string, email?: string | null) {
  let row = await ensureQuotaRow(ipHash)
  if (email && supabaseConfigured()) {
    try {
      const byEmail: any[] = await sbFetch(
        `/rest/v1/aislides_quotas?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
      )
      if (Array.isArray(byEmail) && byEmail[0] && isPaid(byEmail[0])) {
        row = byEmail[0] as QuotaRow
      } else if (!row.email) {
        row.email = email
        await saveQuota(row)
      }
    } catch {
      /* keep IP row */
    }
  } else if (email && !row.email) {
    row.email = email
    await saveQuota(row)
  }

  const paid = isPaid(row)
  const dailyFree = dailyFreeLimit()
  const monthlyCap = paidMonthlyLimit()
  const dailyCap = paidMaxPerDayLimit()

  if (paid) {
    const used = await countUsage(ipHash, email || row.email, true)
    const dailyUsed = await countToday(ipHash)
    const allowance = monthlyCap
    const remaining = remainingPaid(used, monthlyCap, dailyUsed, dailyCap)
    return {
      row,
      used,
      paid,
      period: 'month' as const,
      dailyFree,
      hardCap: monthlyCap,
      allowance,
      remaining,
      dailyUsed,
      dailyCap,
    }
  }

  const used = await countUsage(ipHash, email, false)
  const allowance = dailyFree + (row.bonus_credits || 0)
  const remaining = Math.max(allowance - used, 0)
  return {
    row,
    used,
    paid,
    period: 'day' as const,
    dailyFree,
    hardCap: hardCapLimit(),
    allowance,
    remaining,
  }
}

export async function claimSignupBonus(ipHash: string) {
  const bonus = signupBonusLimit()
  const row = await ensureQuotaRow(ipHash)
  if (row.bonus_claimed_at) {
    return { claimed: false, already: true, bonusCredits: row.bonus_credits }
  }
  row.bonus_credits = (row.bonus_credits || 0) + bonus
  row.bonus_claimed_at = new Date().toISOString()
  await saveQuota(row)
  return { claimed: true, already: false, bonusCredits: row.bonus_credits }
}

export async function createCheckoutIntent(
  ipHash: string,
  plan: Exclude<PlanKey, 'free'>,
  email?: string | null,
) {
  if (supabaseConfigured()) {
    try {
      await sbFetch('/rest/v1/aislides_checkout_intents', {
        method: 'POST',
        body: { ip_hash: ipHash, plan, email: email || null },
      })
    } catch {
      await sbFetch('/rest/v1/aislides_checkout_intents', {
        method: 'POST',
        body: { ip_hash: ipHash, plan },
      })
    }
    return
  }
  memIntents.push({ ip_hash: ipHash, plan, created_at: Date.now(), consumed: false, email: email || null })
}

export async function applyPaidPlan(opts: {
  plan: Exclude<PlanKey, 'free'>
  months: number
  email?: string | null
  subscriptionId?: string | null
  customerId?: string | null
}) {
  const expires = addMonths(new Date(), opts.months).toISOString()
  let ipHash: string | null = null

  if (supabaseConfigured()) {
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    let intents: any[] = []
    if (opts.email) {
      intents = await sbFetch(
        `/rest/v1/aislides_checkout_intents?email=eq.${encodeURIComponent(opts.email)}&plan=eq.${opts.plan}&consumed_at=is.null&created_at=gte.${since}&order=created_at.desc&limit=1`,
      )
    }
    if (!intents?.[0]) {
      intents = await sbFetch(
        `/rest/v1/aislides_checkout_intents?plan=eq.${opts.plan}&consumed_at=is.null&created_at=gte.${since}&order=created_at.asc&limit=1`,
      )
    }
    if (intents?.[0]?.ip_hash) {
      ipHash = intents[0].ip_hash
      await sbFetch(`/rest/v1/aislides_checkout_intents?id=eq.${intents[0].id}`, {
        method: 'PATCH',
        body: { consumed_at: new Date().toISOString() },
      })
    }
  } else {
    const intent = memIntents.find(
      (i) =>
        !i.consumed &&
        i.plan === opts.plan &&
        Date.now() - i.created_at < 2 * 60 * 60 * 1000 &&
        (!opts.email || i.email === opts.email),
    )
    if (intent) {
      intent.consumed = true
      ipHash = intent.ip_hash
    }
  }

  if (!ipHash && opts.email && supabaseConfigured()) {
    const existing: any[] = await sbFetch(
      `/rest/v1/aislides_quotas?email=eq.${encodeURIComponent(opts.email)}&select=ip_hash&limit=1`,
    )
    ipHash = existing?.[0]?.ip_hash || null
  }

  if (!ipHash && opts.email) {
    ipHash = `email:${opts.email.toLowerCase()}`
  }

  if (!ipHash) return { attached: false }

  const row = await ensureQuotaRow(ipHash)
  row.plan = opts.plan
  row.plan_expires_at = expires
  if (opts.email) row.email = opts.email
  if (opts.customerId) row.waffo_customer_id = opts.customerId
  if (opts.subscriptionId) row.waffo_subscription_id = opts.subscriptionId
  await saveQuota(row)
  return { attached: true, ipHash, expires }
}

export async function revokePaidPlan(email?: string | null, subscriptionId?: string | null) {
  if (supabaseConfigured()) {
    const filter = subscriptionId
      ? `waffo_subscription_id=eq.${encodeURIComponent(subscriptionId)}`
      : email
        ? `email=eq.${encodeURIComponent(email)}`
        : ''
    if (!filter) return
    await sbFetch(`/rest/v1/aislides_quotas?${filter}`, {
      method: 'PATCH',
      body: { plan: 'free', plan_expires_at: new Date().toISOString() },
    })
    return
  }
  for (const row of memQuota.values()) {
    if ((subscriptionId && row.waffo_subscription_id === subscriptionId) || (email && row.email === email)) {
      row.plan = 'free'
      row.plan_expires_at = new Date().toISOString()
    }
  }
}

export async function markWebhookEvent(eventId: string): Promise<boolean> {
  if (!eventId) return true
  if (supabaseConfigured()) {
    try {
      await sbFetch('/rest/v1/aislides_webhook_events', {
        method: 'POST',
        body: { event_id: eventId },
      })
      return true
    } catch {
      return false
    }
  }
  if (memEvents.has(eventId)) return false
  memEvents.add(eventId)
  return true
}

export function resolvePlanFromWebhook(data: any): { plan: Exclude<PlanKey, 'free'>; months: number } | null {
  const blob = JSON.stringify(data || {})
  for (const id of Object.keys(PLAN_PRODUCTS)) {
    if (blob.includes(id)) return PLAN_PRODUCTS[id]
  }
  const amount = String(data?.amount ?? data?.total ?? '')
  const byPrice = PLAN_PRICES[amount]
  if (byPrice === 'monthly') return { plan: 'monthly', months: 1 }
  if (byPrice === 'quarterly') return { plan: 'quarterly', months: 3 }
  if (byPrice === 'halfyear') return { plan: 'halfyear', months: 6 }
  if (byPrice === 'annual') return { plan: 'annual', months: 12 }
  const name = String(data?.productName || '').toLowerCase()
  if (name.includes('annual') || name.includes('year')) return { plan: 'annual', months: 12 }
  if (name.includes('quarter')) return { plan: 'quarterly', months: 3 }
  if (name.includes('6') || name.includes('half')) return { plan: 'halfyear', months: 6 }
  if (name.includes('month')) return { plan: 'monthly', months: 1 }
  return { plan: 'monthly', months: 1 }
}
