/**
 * POST /api/generate
 * Body: { topic: string }
 * Returns: { pages, pptxBase64?, remaining, plan, paid }
 */

import { SITE } from '~/composables/useSite'

// ---------- Prompt ----------
const SYSTEM_PROMPT = `You are an expert presentation designer. Given a topic, create a clear slide deck outline.

Return ONLY valid JSON in exactly this shape (no markdown, no commentary):
{"pages":[{"title":"...","bullets":["..."]}]}

Rules:
- Produce 5–12 pages (the server may clamp further by plan)
- Each page title is short and specific
- Each page has 3–5 bullet points (concise, one idea each)
- No images, no speaker notes, no extra keys
- Match the language of the user's topic`

// ---------- Handler ----------
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const topic = (body?.topic || '').toString().trim()
  if (topic.length < 5) {
    throw createError({
      statusCode: 400,
      message: 'Please enter a topic of at least 5 characters.',
    })
  }
  if (topic.length > 2000) {
    throw createError({
      statusCode: 400,
      message: 'Topic is too long (max 2000 characters).',
    })
  }

  const ipHash = getIpHash(event)
  const user = await getRequestUser(event)

  let quota: Awaited<ReturnType<typeof getQuotaState>>
  try {
    quota = await getQuotaState(ipHash, user?.email)
  } catch (e) {
    console.error('Quota read failed:', e)
    quota = {
      row: {
        ip_hash: ipHash,
        bonus_credits: 0,
        bonus_claimed_at: null,
        plan: 'free',
        plan_expires_at: null,
        email: null,
        waffo_customer_id: null,
        waffo_subscription_id: null,
      },
      used: 0,
      paid: false,
      period: 'day' as const,
      dailyFree: dailyFreeLimit(),
      hardCap: hardCapLimit(),
      allowance: dailyFreeLimit(),
      remaining: dailyFreeLimit(),
    }
  }

  if (!quota.paid && quota.used >= quota.hardCap) {
    throw createError({
      statusCode: 429,
      message: 'Fair-use limit reached for today. Please try again tomorrow.',
      data: { remaining: 0, plan: quota.row.plan, paid: quota.paid },
    })
  }

  if (quota.remaining <= 0) {
    throw createError({
      statusCode: 429,
      message: quota.paid
        ? `Monthly presentation limit or daily anti-abuse cap reached. Paid plans allow ${paidMonthlyLimit()} presentations per month (max ${paidMaxPerDayLimit()} per day). Try again tomorrow, or next month if your monthly quota is used.`
        : `Daily free limit reached. Sign up for ${signupBonusLimit()} extra generation, or upgrade to Pro.`,
      data: { remaining: 0, plan: quota.row.plan, paid: quota.paid },
    })
  }

  const remainingAfter = quota.remaining - 1

  // --- call LLM ---
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL || 'deepseek-flash'
  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'LLM API key is not configured.' })
  }

  let llmRaw = ''
  try {
    const res = await $fetch<{ choices: { message: { content: string } }[] }>(
      `${baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: {
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Topic:\n"""${topic}"""` },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        },
        timeout: 60000,
      },
    )
    llmRaw = res.choices?.[0]?.message?.content || ''
  } catch (e: any) {
    console.error('LLM call failed:', e?.message || e)
    throw createError({
      statusCode: 502,
      message: 'The generator is busy right now. Please try again in a moment.',
    })
  }

  const parsed = parseSlidesJson(llmRaw)
  if (!parsed) {
    console.error('LLM returned unparsable output:', llmRaw.slice(0, 500))
    throw createError({
      statusCode: 502,
      message: 'Something went wrong while generating. Please try again.',
    })
  }

  const maxPages = quota.paid ? SITE.paidMaxPages : SITE.freeMaxPages
  const pages = clampPages(parsed.pages, maxPages)
  if (pages.length === 0) {
    throw createError({
      statusCode: 502,
      message: 'Could not generate usable slides. Please add more detail to your topic and retry.',
    })
  }

  // --- record usage ---
  try {
    await recordGeneration(ipHash, { pages }, user?.email)
  } catch (e) {
    console.error('Record generation failed (non-fatal):', e)
  }

  let pptxBase64: string | undefined
  try {
    const buffer = await buildPptxBuffer(pages, {
      watermark: !quota.paid,
      brand: SITE.name,
    })
    pptxBase64 = buffer.toString('base64')
  } catch (e) {
    console.error('PPTX build failed (non-fatal):', e)
  }

  return {
    pages,
    pptxBase64,
    remaining: Math.max(remainingAfter, 0),
    plan: quota.row.plan,
    paid: quota.paid,
  }
})
