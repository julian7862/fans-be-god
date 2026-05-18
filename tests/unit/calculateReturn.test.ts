import { describe, it, expect } from 'vitest'
import {
  calculateSingleReturnPct,
  calculateAverageBuyCost,
  calculateUnrealizedReturnPct,
  calculateRealizedReturnPct,
  calculateAnnualizedReturnPct,
} from '@/lib/performance/calculateReturn'

describe('calculateSingleReturnPct', () => {
  it('returns correct positive return', () => {
    expect(calculateSingleReturnPct(100, 120)).toBe(20)
  })

  it('returns correct negative return', () => {
    expect(calculateSingleReturnPct(100, 80)).toBe(-20)
  })

  it('returns 0 when buy == sell', () => {
    expect(calculateSingleReturnPct(100, 100)).toBe(0)
  })

  it('returns 0 when buy price is 0', () => {
    expect(calculateSingleReturnPct(0, 100)).toBe(0)
  })
})

describe('calculateAverageBuyCost', () => {
  it('calculates weighted average for multiple buy lots', () => {
    const lots = [
      { action: 'buy' as const, price: 100, quantity: 10 },
      { action: 'buy' as const, price: 120, quantity: 10 },
    ]
    expect(calculateAverageBuyCost(lots)).toBe(110)
  })

  it('ignores sell lots', () => {
    const lots = [
      { action: 'buy' as const, price: 100, quantity: 10 },
      { action: 'sell' as const, price: 150, quantity: 5 },
    ]
    expect(calculateAverageBuyCost(lots)).toBe(100)
  })

  it('returns 0 for empty array', () => {
    expect(calculateAverageBuyCost([])).toBe(0)
  })

  it('handles weighted average correctly', () => {
    const lots = [
      { action: 'buy' as const, price: 100, quantity: 20 },
      { action: 'buy' as const, price: 200, quantity: 10 },
    ]
    expect(calculateAverageBuyCost(lots)).toBeCloseTo(133.33, 1)
  })
})

describe('calculateUnrealizedReturnPct', () => {
  it('returns positive unrealized return', () => {
    expect(calculateUnrealizedReturnPct(120, 100)).toBe(20)
  })

  it('returns negative unrealized return', () => {
    expect(calculateUnrealizedReturnPct(80, 100)).toBe(-20)
  })

  it('returns 0 when average cost is 0', () => {
    expect(calculateUnrealizedReturnPct(100, 0)).toBe(0)
  })
})

describe('calculateRealizedReturnPct', () => {
  it('returns correct realized return', () => {
    expect(calculateRealizedReturnPct(2000, 10000)).toBe(20)
  })

  it('returns 0 when invested cost is 0', () => {
    expect(calculateRealizedReturnPct(100, 0)).toBe(0)
  })
})

describe('calculateAnnualizedReturnPct', () => {
  it('annualizes a 10% return over 180 days', () => {
    const result = calculateAnnualizedReturnPct(10, 180)
    expect(result).toBeGreaterThan(10)
    expect(result).toBeCloseTo(21.32, 0)
  })

  it('returns 0 for 0 holding days', () => {
    expect(calculateAnnualizedReturnPct(10, 0)).toBe(0)
  })

  it('returns same as holding return for 365 days', () => {
    const result = calculateAnnualizedReturnPct(10, 365)
    expect(result).toBeCloseTo(10, 5)
  })
})
