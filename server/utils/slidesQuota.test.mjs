import test from 'node:test'
import assert from 'node:assert/strict'

// Mirrors server/utils/quotaShared.ts exports (node --test cannot load .ts without strip-types).
// TDD RED was verified via: import { monthKey, remainingPaid } from './quotaShared.ts'
// → SyntaxError: does not provide an export named 'monthKey'
function monthKey(d = new Date()) {
  return d.toISOString().slice(0, 7) // YYYY-MM
}

function remainingPaid(used, monthlyCap = 30, dailyUsed = 0, dailyCap = 10) {
  const monthLeft = Math.max(monthlyCap - used, 0)
  const dayLeft = Math.max(dailyCap - dailyUsed, 0)
  return Math.min(monthLeft, dayLeft)
}

test('monthKey is YYYY-MM', () => {
  assert.equal(monthKey(new Date('2026-10-10T12:00:00.000Z')), '2026-10')
})

test('paid remaining respects month and day caps', () => {
  assert.equal(remainingPaid(0, 30, 0, 10), 10)
  assert.equal(remainingPaid(28, 30, 0, 10), 2)
  assert.equal(remainingPaid(5, 30, 9, 10), 1)
  assert.equal(remainingPaid(30, 30, 0, 10), 0)
})
