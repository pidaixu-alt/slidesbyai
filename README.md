# Tagtery — Etsy Tag Generator

Etsy Tag Generator — paste a product description, get 13 ready-to-use tags (≤20 chars each) + 5 optimized titles (≤140 chars each).

## Stack
- Nuxt 3 (Vue 3 + SSR — required for SEO/AI crawler visibility)
- Server API route calls an OpenAI-compatible LLM (DeepSeek by default)
- Deploy: Vercel · DNS/CDN: Cloudflare · Domain: Spaceship

## Run locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Environment (.env)
```
LLM_BASE_URL=https://api.deepseek.com
LLM_API_KEY=sk-xxx
LLM_MODEL=deepseek-chat
DAILY_FREE_LIMIT=3

# Supabase (optional — falls back to in-memory limit if empty)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Switching LLM provider = change env vars only (any OpenAI-compatible API works: OpenAI, OpenRouter, Qwen, GLM…).

## Supabase setup
1. Open the project in Supabase → SQL Editor → New query
2. Paste and run `supabase/schema.sql` (creates `tagtool_generations` + `tagtool_profiles` + RLS — prefixed to avoid clashing with existing tables)
3. Copy Project URL + anon key + service_role key from Settings → API Keys into `.env`
4. Leave `SUPABASE_*` empty to use the in-memory rate limiter (fine for local dev)

## Pages
- `/` — generator + FAQ + specifics (the one-page-two-bites SEO pattern)
- `/pricing` — Free (1/day) vs Monthly $9 · Quarterly $20 · Annual $72 (all unlimited)
- `/legal/terms`, `/legal/privacy` — required by payment provider (Waffo)

## Roadmap (post-MVP)
- Supabase: persistent rate limiting + auth + Pro plan management
- Waffo hosted checkout + webhook → profiles.plan
- /etsy-title-generator variant page
- GSC + Bing Webmaster Tools + IndexNow on launch

## Notes
- Brand: Tagtery (tagtery.com) — single source of truth in `composables/useSite.ts`
- robots.txt/sitemap.xml point to tagtery.com
- Waffo product declaration: "Etsy SEO & listing optimization tool" (NOT "AI generator")
