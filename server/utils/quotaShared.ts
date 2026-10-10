import { createHash } from 'node:crypto'

export type PlanKey = 'free' | 'monthly' | 'quarterly' | 'halfyear' | 'annual'

export const PLAN_PRODUCTS: Record<string, { plan: Exclude<PlanKey, 'free'>; months: number }> = {
  // Current live products
  PROD_3vO5tmtdpI5rVLgeMnINVx: { plan: 'monthly', months: 1 },
  PROD_6mF7j0m59LfLzl5gYvSj10: { plan: 'quarterly', months: 3 },
  PROD_4iYdAD907eAqIhIXCx4p1A: { plan: 'annual', months: 12 },
  // Legacy products (keep for webhook mapping of old purchases)
  PROD_1IEET4PqkTvAZPUu5U4o83: { plan: 'halfyear', months: 6 },
  PROD_1Kqi16sNEZpqz3RJzgcFeh: { plan: 'monthly', months: 1 },
  PROD_2190BForCrQ4xSrp8EXYp7: { plan: 'halfyear', months: 6 },
  PROD_5Zc25cCh0rfEBaUAWRxXNE: { plan: 'annual', months: 12 },
}

export const PLAN_PRICES: Record<string, Exclude<PlanKey, 'free'>> = {
  '9': 'monthly',
  '9.00': 'monthly',
  '20': 'quarterly',
  '20.00': 'quarterly',
  '45': 'halfyear',
  '45.00': 'halfyear',
  '72': 'annual',
  '72.00': 'annual',
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function getIpHash(event: any): string {
  const ip =
    event.node.req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
    event.node.req.socket?.remoteAddress ||
    'unknown'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24)
}

export function supabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function sbFetch(path: string, init: any = {}) {
  const url = process.env.SUPABASE_URL!.replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return $fetch(url + path, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  })
}

export function dailyFreeLimit() {
  return parseInt(process.env.DAILY_FREE_LIMIT || '1', 10)
}

export function signupBonusLimit() {
  return parseInt(process.env.SIGNUP_BONUS || '1', 10)
}

export function hardCapLimit() {
  return parseInt(process.env.DAILY_HARD_CAP || '300', 10)
}

export function addMonths(from: Date, months: number) {
  const d = new Date(from)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d
}
