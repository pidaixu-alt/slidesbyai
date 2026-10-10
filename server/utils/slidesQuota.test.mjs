import test from 'node:test'
import assert from 'node:assert/strict'
import { monthKey, remainingPaid } from './quotaShared.ts'

test('monthKey is YYYY-MM', () => {
  assert.equal(monthKey(new Date('2026-10-10T12:00:00.000Z')), '2026-10')
})

test('paid remaining respects month and day caps', () => {
  assert.equal(remainingPaid(0, 30, 0, 10), 10)
  assert.equal(remainingPaid(28, 30, 0, 10), 2)
  assert.equal(remainingPaid(5, 30, 9, 10), 1)
  assert.equal(remainingPaid(30, 30, 0, 10), 0)
})
