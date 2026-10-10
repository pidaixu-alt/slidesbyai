export type SlidePage = { title: string; bullets: string[] }
export type SlidesDoc = { pages: SlidePage[] }

function isSlidePage(value: unknown): value is SlidePage {
  if (!value || typeof value !== 'object') return false
  const page = value as Record<string, unknown>
  if (typeof page.title !== 'string') return false
  if (!Array.isArray(page.bullets)) return false
  return page.bullets.every((b) => typeof b === 'string')
}

function normalizeDoc(parsed: unknown): SlidesDoc | null {
  if (!parsed || typeof parsed !== 'object') return null
  const pages = (parsed as { pages?: unknown }).pages
  if (!Array.isArray(pages) || pages.length === 0) return null
  if (!pages.every(isSlidePage)) return null
  return { pages }
}

function extractJsonCandidate(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence?.[1]) return fence[1].trim()

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1)

  return trimmed
}

export function parseSlidesJson(raw: string): SlidesDoc | null {
  if (typeof raw !== 'string') return null
  const candidate = extractJsonCandidate(raw)
  if (!candidate) return null
  try {
    return normalizeDoc(JSON.parse(candidate))
  } catch {
    return null
  }
}

export function clampPages(pages: SlidePage[], maxPages: number): SlidePage[] {
  if (!Array.isArray(pages)) return []
  if (!Number.isFinite(maxPages) || maxPages <= 0) return []
  return pages.slice(0, Math.floor(maxPages))
}
