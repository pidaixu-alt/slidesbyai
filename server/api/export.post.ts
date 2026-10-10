/**
 * POST /api/export
 * Body: { pages: { title: string, bullets: string[] }[] }
 * Returns: { pptxBase64, paid, plan }
 *
 * Rebuilds PPTX from already-generated (possibly edited) pages.
 * Does NOT call recordGeneration or decrement quota — only /api/generate charges.
 */

import { SITE } from '~/composables/useSite'
import type { SlidePage } from '../utils/slides'

function isSlidePage(value: unknown): value is SlidePage {
  if (!value || typeof value !== 'object') return false
  const page = value as Record<string, unknown>
  if (typeof page.title !== 'string') return false
  if (!Array.isArray(page.bullets)) return false
  return page.bullets.every((b) => typeof b === 'string')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const rawPages = body?.pages

  if (!Array.isArray(rawPages) || rawPages.length === 0 || !rawPages.every(isSlidePage)) {
    throw createError({
      statusCode: 400,
      message: 'Please provide a non-empty pages array with title and bullets.',
    })
  }

  const ipHash = getIpHash(event)
  const user = await getRequestUser(event)

  let paid = false
  let plan = 'free'
  try {
    const quota = await getQuotaState(ipHash, user?.email)
    paid = quota.paid
    plan = quota.row.plan
  } catch (e) {
    console.error('Quota read failed on export (defaulting free watermark):', e)
  }

  const maxPages = paid ? SITE.paidMaxPages : SITE.freeMaxPages
  const pages = clampPages(rawPages, maxPages)
  if (pages.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No exportable slides after plan page limits.',
    })
  }

  const buffer = await buildPptxBuffer(pages, {
    watermark: !paid,
    brand: SITE.name,
  })

  return {
    pptxBase64: buffer.toString('base64'),
    paid,
    plan,
  }
})
