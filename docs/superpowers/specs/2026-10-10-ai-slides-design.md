# AI Slides — Product Design Spec

**Date:** 2026-10-10  
**Status:** Draft for review  
**Keyword:** `ai slides` (primary SEO)  
**Stack template:** Tagtery (`etsy-tag-tool`) + `ship-paid-site` skill  
**Decision trail:** Web.Cafe data service → reject ArtCraft for subscription → choose `ai slides` → day-1 paid → pricing plan A

---

## 1. Problem & promise

People search for “ai slides” / “ai presentation maker” wanting a **topic → editable deck** in minutes. Incumbents (Gamma, SlidesAI, MagicSlides, Presenti) are crowded at the brand level, but dedicated indie homepages still rank, and long-tail inner pages are plentiful.

**Promise:** Paste a topic (or short outline) → get a 5–12 page presentation → download PPTX. Free daily trial; paid monthly quota.

**Not building:** Portrait/image generation, full canvas editor, Google Slides live sync, Word/PDF import (v1).

---

## 2. SEO strategy

| Role | Keywords |
|------|----------|
| Homepage | `ai slides`, `ai slides generator` |
| Inner pages (first wave) | `ai presentation maker`, `ppt ai`, `slides ai free`, `best ai for slides`, `free ai slides generator` |
| Compare pages | vs Gamma, vs Genspark (not competing on their brand head terms) |

**Web.Cafe signals (2026-10-10):** 值得做 · GPTs×1.58 · ~11 dedicated SERP pages (few true indie homepages) · large inner-page candidate set.

Do **not** target `genspark ai slides` / `gamma ai slides` as primary homepage keywords (brand intent → their sites).

---

## 3. Product UX (MVP)

### Homepage (one composition)

1. Brand + one headline + one short line  
2. Topic input + example chips (Pitch / Lesson / Report) + Generate  
3. Optional: outline preview → confirm → generate (reduces waste)  
4. Result: slide cards (title + bullets), edit per-slide text, Download PPTX  
5. Below fold: How it works (3 steps) + FAQ + links to inner SEO pages  

Pattern: Presenti / MagicSlides “prompt-first hero”; Tagtery “one-page-two-bites” SEO body.

### Generation

- LLM returns structured JSON: `{ pages: [{ title, bullets[] }] }`  
- Server builds **PPTX** (e.g. pptxgenjs) with 2–3 simple templates  
- Caps: free ≤5 pages/run; paid ≤12 pages/run  
- Free exports include a light watermark slide or footer; paid removes it  

### Auth & quota

Same patterns as Tagtery:

- Free works without signup (IP quota); signup bonus  
- Checkout requires login  
- Confirm email **off**; password reset via server Admin-check + recover redirect to `/reset-password`  
- Waffo hosted checkout + webhook → profile plan  

---

## 4. Pricing (Plan A — approved)

Aligned with MagicSlides-style **presentations/month** metering (not “unlimited”).

| Plan | Price | Quota | Limits |
|------|-------|-------|--------|
| Free | $0 | **1 generation / day** | ≤5 pages, watermark, PPTX ok |
| Monthly | **$9** / month | **30 presentations / month** | ≤12 pages, no watermark |
| Quarterly | **$20** / quarter | Same as monthly | Same |
| Annual | **$72** / year | Same as monthly | Same (default highlight) |

**Anti-abuse (hidden, not marketed):** ≤10 generations / day even on paid; `max_tokens` hard cap per request (~4k).

**Signup bonus:** +1 generation (same idea as Tagtery).

Competitor context: MagicSlides Essential ≈ $8/mo for 10 decks; SlidesAI/Gamma entry ≈ $9–12/mo with credits. Plan A is slightly more generous on deck count at a similar price, with DeepSeek Flash unit economics that stay healthy (~$0.002–0.004 LLM per deck → ~$0.06–0.12/mo at full 30).

---

## 5. Unit economics (must hold)

| Item | Assumption |
|------|------------|
| Model | `deepseek-flash` (not Pro for MVP) |
| Cost / deck | ~$0.002 off-peak · ~$0.004 peak |
| Paid worst case (30/mo) | **≪ $0.20** LLM |
| Free worst case (30/mo) | ~$0.12 LLM |

Do **not** ship Tagtery’s “unlimited + 300/day fair use” for this product — slide outputs are larger and would break margin under abuse.

Fixed ops: new domain, new Supabase project, Aliyun `mail.<apex>`, Vercel, Waffo products — per `ship-paid-site`.

---

## 6. Architecture

```
Browser (Nuxt 3 SSR)
  → POST /api/generate { topic, outline? }
  → quota check (IP / user / plan)
  → LLM JSON
  → PPTX buffer (or JSON preview + separate /api/export)
  → response

Auth: Supabase (new project)
Pay: Waffo (3 subscription product IDs)
Email: Aliyun DirectMail SMTP on mail.<apex>
Deploy: Vercel + Cloudflare DNS (Spaceship registrar)
```

Codebase: **copy Tagtery** → rename `useSite`, tables prefix, product copy. Do not reuse Tagtery Supabase.

---

## 7. Launch checklist (high level)

Follow `ship-paid-site` skill order after product name + apex + support email are chosen:

1. User: buy domain + NS → Cloudflare  
2. Clone repo, brand constants  
3. Cloudflare DNS → Vercel + mail records  
4. Aliyun send domain + SMTP  
5. New Supabase + SQL + Auth + Custom SMTP  
6. Waffo three products + webhook  
7. Vercel env + deploy  
8. Smoke: signup, checkout gate, reset email, correct supabaseUrl  

SEO day-1: homepage + legal + pricing; IndexNow/GSC after live. Inner SEO pages can ship in the same week as thin but real pages (not empty stubs).

---

## 8. Out of scope (v1)

- Image/icon generation inside slides  
- Google Slides OAuth export  
- Full drag-and-drop editor  
- Team seats / Brand Kit  
- Mobile apps  
- Multi-language UI (English-first OK; generation language = user topic language)

---

## 9. Open decisions (needed before build)

User must supply before `ship-paid-site` execution:

1. **Product / brand name**  
2. **Apex domain**  
3. **Support email** (can be `support@mail.<apex>` or separate inbox)  

Pricing numbers above are fixed unless explicitly changed.

---

## 10. Success criteria (first 30 days)

- Site live with paid checkout working  
- Free path: topic → deck → PPTX without login  
- Paid path: login → Waffo → 30/mo quota enforced  
- GSC property verified; homepage submitted  
- At least 5 SEO inner pages indexed or submitted  

---

## Approval

- §1 Product boundary: approved  
- §2 IA / MVP / pricing: approved, then revised after competitor + cost review  
- **Pricing Plan A:** approved 2026-10-10 (`$9 = 30 presentations/month`)
