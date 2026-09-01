import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveTheme } from './theme.ts'

test('uses a valid saved theme before the system preference', () => {
  assert.equal(resolveTheme('light', true), 'light')
  assert.equal(resolveTheme('dark', false), 'dark')
})

test('falls back to the system preference for missing or invalid values', () => {
  assert.equal(resolveTheme(null, true), 'dark')
  assert.equal(resolveTheme('sepia', false), 'light')
})
