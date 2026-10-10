/**
 * POST /api/generate
 * Body: { description: string }
 * Returns: { tags, titles, remaining, plan, paid }
 */

// ---------- Prompt ----------
const SYSTEM_PROMPT = `You are an Etsy SEO expert with 10 years of experience helping small sellers rank their listings.

Given a product description, generate:

1. EXACTLY 13 Etsy tags:
   - Each tag MUST be 20 characters or fewer (Etsy's hard limit) — count carefully
   - Mix of: long-tail phrases, category terms, material terms, style terms, occasion terms, audience terms
   - No trademarked brand names (no "Disney", "Nike" etc.)
   - No duplicates or near-duplicates
   - All lowercase

2. 5 listing title options:
   - Each title MUST be 140 characters or fewer — count carefully
   - Front-load the strongest keywords (first 40 chars matter most)
   - Include: product type + key attribute + material/style + use case or recipient
   - Natural and readable, not keyword-stuffed

Return ONLY valid JSON in exactly this shape:
{"tags": ["tag1", "...13 total"], "titles": ["title1", "...5 total"]}`

// ---------- Helpers ----------
function parseLLMJson(raw: string): { tags: string[]; titles: string[] } | null {
  let text = raw.trim()
  // strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    const obj = JSON.parse(text.slice(start, end + 1))
    if (!Array.isArray(obj.tags) || !Array.isArray(obj.titles)) return null
    return { tags: obj.tags, titles: obj.titles }
  } catch {
    return null
  }
}

function cleanTags(tags: any[]): string[] {
  return tags
    .filter((t) => typeof t === 'string')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 20)
    .filter((t, i, arr) => arr.indexOf(t) === i) // dedupe
    .slice(0, 13)
}

function cleanTitles(titles: any[]): string[] {
  return titles
    .filter((t) => typeof t === 'string')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => (t.length <= 140 ? t : t.slice(0, 139) + '…'))
    .slice(0, 5)
}

// ---------- Handler ----------
export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  let description = (body?.description || '').toString().trim()
  if (description.length < 10) {
    throw createError({
      statusCode: 400,
      message: 'Please paste a bit more detail about your product (at least 10 characters).',
    })
  }
  if (description.length > 2000) description = description.slice(0, 2000)

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

  if (quota.used >= quota.hardCap) {
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
        ? 'Fair-use limit reached for today. Please try again tomorrow.'
        : `Daily free limit reached. Sign up for ${signupBonusLimit()} extra generation, or upgrade to Pro.`,
      data: { remaining: 0, plan: quota.row.plan, paid: quota.paid },
    })
  }

  const remainingAfter = quota.remaining - 1

  // --- call LLM ---
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
  const apiKey = process.env.LLM_API_KEY
  const model = process.env.LLM_MODEL || 'deepseek-chat'
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
            { role: 'user', content: `Product description:\n"""${description}"""` },
          ],
          temperature: 0.8,
          max_tokens: 1200,
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

  const parsed = parseLLMJson(llmRaw)
  if (!parsed) {
    console.error('LLM returned unparsable output:', llmRaw.slice(0, 500))
    throw createError({
      statusCode: 502,
      message: 'Something went wrong while generating. Please try again.',
    })
  }

  const tags = cleanTags(parsed.tags)
  const titles = cleanTitles(parsed.titles)
  if (tags.length === 0 || titles.length === 0) {
    throw createError({
      statusCode: 502,
      message: 'Could not generate usable results. Please add more detail about your product and retry.',
    })
  }

  // --- record usage ---
  try {
    await recordGeneration(ipHash, { tags, titles }, user?.email)
  } catch (e) {
    console.error('Record generation failed (non-fatal):', e)
  }

  return {
    tags,
    titles,
    remaining: Math.max(remainingAfter, 0),
    plan: quota.row.plan,
    paid: quota.paid,
  }
})
