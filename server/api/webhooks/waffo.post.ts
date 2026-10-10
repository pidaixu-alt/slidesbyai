/**
 * Waffo Pancake webhook.
 * Dashboard → Settings → Webhooks → HTTP →
 *   https://www.tagtery.com/api/webhooks/waffo
 */

import { verifyWebhook, WebhookEventType } from '@waffo/pancake-ts'

function pickData(body: any) {
  return body?.data || body?.result || body || {}
}

export default defineEventHandler(async (event) => {
  const raw = await readRawBody(event)
  if (!raw) {
    throw createError({ statusCode: 400, message: 'empty' })
  }
  const rawText = typeof raw === 'string' ? raw : raw.toString('utf-8')
  const sig = getHeader(event, 'x-waffo-signature') || getHeader(event, 'X-Waffo-Signature') || ''
  const preferred = (process.env.WAFFO_ENV || 'prod') as 'prod' | 'test'
  const fallback = preferred === 'prod' ? 'test' : 'prod'

  let payload: any
  try {
    payload = verifyWebhook(rawText, sig, { environment: preferred })
  } catch {
    try {
      payload = verifyWebhook(rawText, sig, { environment: fallback })
    } catch {
      throw createError({ statusCode: 401, message: 'Invalid signature' })
    }
  }

  const eventType = String(payload?.eventType || payload?.type || '')
  const eventId = String(payload?.id || payload?.eventId || '')
  const data = pickData(payload)

  if (eventId) {
    const fresh = await markWebhookEvent(eventId)
    if (!fresh) return { ok: true, duplicate: true }
  }

  const email = data.buyerEmail || data.email || data.metadata?.email || null
  const subscriptionId = data.subscriptionId || data.orderId || null
  const customerId = data.customerId || data.buyerId || null

  const paidEvents = new Set([
    WebhookEventType.OrderCompleted,
    WebhookEventType.SubscriptionActivated,
    WebhookEventType.SubscriptionPaymentSucceeded,
    WebhookEventType.SubscriptionRenewed,
    WebhookEventType.SubscriptionRecovered,
    WebhookEventType.SubscriptionUncanceled,
    'subscription.uncanceled',
    'subscription.recovered',
    'subscription.renewed',
    'order.completed',
    'subscription.activated',
    'subscription.payment_succeeded',
  ])

  if (paidEvents.has(eventType)) {
    const resolved = resolvePlanFromWebhook({ ...data, ...payload, metadata: data.metadata || payload.metadata })
    if (resolved) {
      await applyPaidPlan({
        plan: resolved.plan,
        months: resolved.months,
        email,
        subscriptionId,
        customerId,
      })
    }
  }

  if (
    eventType === WebhookEventType.SubscriptionCanceled ||
    eventType === 'subscription.canceled' ||
    eventType === WebhookEventType.RefundSucceeded ||
    eventType === 'refund.succeeded'
  ) {
    await revokePaidPlan(email, subscriptionId)
  }

  return { ok: true }
})
