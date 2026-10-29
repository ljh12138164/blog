import { describe, expect, it } from 'vitest'
import { isAdSlot } from './adsense'

describe('manual ad configuration', () => {
  it('only accepts an explicit AdSense slot ID', () => {
    expect(isAdSlot('1234567890')).toBe(true)
    for (const value of ['', undefined, null, 1234567890, 'ca-pub-1234567890', 'placeholder']) {
      expect(isAdSlot(value)).toBe(false)
    }
  })
})
