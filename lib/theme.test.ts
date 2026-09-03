import { describe, expect, it } from 'vitest'
import { resolveTheme } from './theme.ts'

describe('resolveTheme', () => {
  it('uses a valid saved theme before the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('falls back to the system preference for missing or invalid values', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme('sepia', false)).toBe('light')
  })
})
