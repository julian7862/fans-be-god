import { describe, it, expect } from 'vitest'

// Replicate the toNum helper from server actions
function toNum(v: string | null | undefined): number | undefined {
  if (!v || v === '') return undefined
  const n = Number(v)
  return isNaN(n) ? undefined : n
}

describe('toNum (FormData string → number helper)', () => {
  it('converts valid number string', () => {
    expect(toNum('30000')).toBe(30000)
  })

  it('converts decimal string', () => {
    expect(toNum('123.45')).toBe(123.45)
  })

  it('converts negative number string', () => {
    expect(toNum('-50')).toBe(-50)
  })

  it('returns undefined for empty string', () => {
    expect(toNum('')).toBeUndefined()
  })

  it('returns undefined for null', () => {
    expect(toNum(null)).toBeUndefined()
  })

  it('returns undefined for undefined', () => {
    expect(toNum(undefined)).toBeUndefined()
  })

  it('returns undefined for non-numeric string', () => {
    expect(toNum('abc')).toBeUndefined()
  })

  it('converts "0" to 0', () => {
    expect(toNum('0')).toBe(0)
  })

  it('handles whitespace-only string (JS Number trims → 0)', () => {
    // Number('   ') === 0 in JS — this won't occur from HTML number inputs
    expect(toNum('   ')).toBe(0)
  })
})
