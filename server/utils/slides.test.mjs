import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSlidesJson, clampPages } from './slides.ts'

test('parseSlidesJson reads pages', () => {
  const raw = JSON.stringify({ pages: [{ title: 'Hi', bullets: ['a', 'b'] }] })
  const out = parseSlidesJson(raw)
  assert.equal(out.pages.length, 1)
  assert.equal(out.pages[0].title, 'Hi')
})

test('parseSlidesJson tolerates fenced JSON', () => {
  const raw = 'Here you go:\n```json\n{"pages":[{"title":"Fenced","bullets":["x"]}]}\n```\n'
  const out = parseSlidesJson(raw)
  assert.ok(out)
  assert.equal(out.pages[0].title, 'Fenced')
})

test('parseSlidesJson returns null on invalid', () => {
  assert.equal(parseSlidesJson('not json'), null)
  assert.equal(parseSlidesJson('{"pages":[]}'), null)
  assert.equal(parseSlidesJson('{"pages":[{"title":1,"bullets":[]}]}'), null)
})

test('clampPages truncates', () => {
  const pages = Array.from({ length: 20 }, (_, i) => ({ title: String(i), bullets: ['x'] }))
  assert.equal(clampPages(pages, 5).length, 5)
})
