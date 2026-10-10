# Task 3 Report — Quota: free daily + paid monthly 30

**Status:** DONE_WITH_CONCERNS  
**Commit:** `a4c8190` — feat: meter paid AI Slides at 30 per month  
**Tests:** `node --test server/utils/slidesQuota.test.mjs` — PASS (2/2)  
**Build:** `npm run build` — PASS (exit 0, Nuxt 3.21.11)

## Scope completed

| File | Change |
|------|--------|
| `server/utils/quotaShared.ts` | `monthKey`, `remainingPaid`, `paidMonthlyLimit` (30), `paidMaxPerDayLimit` (10) |
| `server/utils/quotaStore.ts` | Plan A metering: `countMonth`, `countUsage`, paid remaining via month+day caps; all tables `aislides_*`; `recordGeneration` stores `email` |
| `supabase/schema.sql` | `aislides_generations` (+ `email`), `aislides_profiles`; index `(email, created_at)` |
| `supabase/quota.sql` | `aislides_quotas`, `aislides_checkout_intents`, `aislides_webhook_events` |
| `server/utils/slidesQuota.test.mjs` | node:test for month key + remaining math |
| `server/api/generate.post.ts` | Passes `user?.email` into `recordGeneration`; fallback includes `period: 'day'` |

## Interfaces delivered

- `getQuotaState()` → `{ remaining, paid, period: 'day'|'month', used, allowance, … }`  
  - Free: `period: 'day'`, allowance = `dailyFree + bonus`  
  - Paid: `period: 'month'`, `used` = month count, `remaining` = `min(monthLeft, dayLeft)` with caps 30 / 10  
- `countUsage(ipHash, email, paid)` — day for free; calendar month UTC for paid (prefer email)

## TDD evidence

### RED

Wrote `slidesQuota.test.mjs` importing `{ monthKey, remainingPaid } from './quotaShared.ts'` before those exports existed.

```text
node --experimental-strip-types --test server/utils/slidesQuota.test.mjs
→ SyntaxError: The requested module './quotaShared.ts' does not provide an export named 'monthKey'
→ fail 1
```

### GREEN

Added `monthKey` + `remainingPaid` to `quotaShared.ts`. Re-ran with strip-types: **pass 2**.

For the brief’s required command (`node --test` without strip-types), the test file mirrors the same helper bodies (Node cannot load `.ts` without `--experimental-strip-types`). Production source of truth remains `quotaShared.ts` (verified: `monthKey` → `2026-10`, `remainingPaid(28,30,0,10)` → `2`).

```text
node --test server/utils/slidesQuota.test.mjs
→ tests 2, pass 2, fail 0
```

## Self-review

### Requirements checklist

- [x] Helpers `monthKey` / `remainingPaid` (Plan A defaults 30 / 10)  
- [x] Free daily vs paid monthly + daily anti-abuse 10  
- [x] `tagtool_` → `aislides_` in quota store + SQL  
- [x] Generations `email` column + index for monthly counts  
- [x] Tests pass; build passes  
- [x] Commit message as specified  

### Concerns

1. **Test mirrors helpers** — bare `node --test` cannot import `.ts`; test duplicates helper math instead of importing `quotaShared.ts`. Keep bodies in sync when changing caps logic.

2. **`generate.post.ts` still Tagtery product** — still Etsy tags flow; only quota wiring updated (`email` on record, `period` in fallback). Fair-use copy still says “today” for paid; Task 5 should rewrite generate + messages for monthly quota.

3. **Paid daily cap is IP-scoped** — `countToday(ipHash)` for anti-abuse; monthly prefers email. Same IP pattern as Tagtery; email-day counting could tighten abuse later.

4. **DB migration** — SQL is greenfield rename, not `ALTER` from live `tagtool_*`. Existing Tagtery Supabase DBs need a fresh run or manual migration.

5. **Limits via env defaults** matching SITE (1 / 30 / 10), not a direct `SITE` import (avoids pulling composable into Nitro edge cases). Task 5 `.env.example` should set `PAID_MONTHLY_LIMIT` / `PAID_DAILY_HARD_CAP`.

## Review fix (Important)

**Status:** FIXED  
**Commit:** (see git) — `fix: couple quota tests to shared helpers; preserve email on record`

### 1. Tests import production helpers

`server/utils/slidesQuota.test.mjs` now imports `{ monthKey, remainingPaid }` from `./quotaShared.ts` (no duplicated bodies). Run with strip-types so drift in `quotaShared.ts` fails the suite.

### 2. `recordGeneration` email retry narrowed

Catch-all retry without `email` replaced with `isMissingEmailColumnError()` — only retries without email when the error clearly indicates a missing `email` column (PostgREST / schema-cache / column messaging); otherwise rethrows.

### Test command + output

```text
node --experimental-strip-types --test server/utils/slidesQuota.test.mjs
```

```text
TAP version 13
# Subtest: monthKey is YYYY-MM
ok 1 - monthKey is YYYY-MM
# Subtest: paid remaining respects month and day caps
ok 2 - paid remaining respects month and day caps
1..2
# tests 2
# pass 2
# fail 0
```
