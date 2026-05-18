import { describe, it, expect } from 'vitest'
import {
  calculateGroupAverageReturnPct,
  calculateMedianReturnPct,
  calculateWinRate,
  calculateAverageWinPct,
  calculateAverageLossPct,
  calculateProfitLossRatio,
  calculateConsensusMetrics,
} from '@/lib/performance/calculateMetrics'

describe('calculateGroupAverageReturnPct', () => {
  it('returns average of member returns', () => {
    expect(calculateGroupAverageReturnPct([10, 20, 30])).toBe(20)
  })

  it('returns 0 for empty array', () => {
    expect(calculateGroupAverageReturnPct([])).toBe(0)
  })

  it('handles negative returns', () => {
    expect(calculateGroupAverageReturnPct([-10, 10])).toBe(0)
  })
})

describe('calculateMedianReturnPct', () => {
  it('returns median for odd count', () => {
    expect(calculateMedianReturnPct([10, 20, 30])).toBe(20)
  })

  it('returns median for even count', () => {
    expect(calculateMedianReturnPct([10, 20, 30, 40])).toBe(25)
  })

  it('returns 0 for empty array', () => {
    expect(calculateMedianReturnPct([])).toBe(0)
  })

  it('handles unsorted input', () => {
    expect(calculateMedianReturnPct([30, 10, 20])).toBe(20)
  })
})

describe('calculateWinRate', () => {
  it('returns correct win rate', () => {
    expect(calculateWinRate([10, -5, 20, -10])).toBe(50)
  })

  it('returns 100 when all positive', () => {
    expect(calculateWinRate([10, 20, 30])).toBe(100)
  })

  it('returns 0 when all negative', () => {
    expect(calculateWinRate([-10, -20])).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(calculateWinRate([])).toBe(0)
  })

  it('does not count 0 as a win', () => {
    expect(calculateWinRate([0, 10])).toBe(50)
  })
})

describe('calculateAverageWinPct', () => {
  it('returns average of winning returns only', () => {
    expect(calculateAverageWinPct([10, -5, 20, -10])).toBe(15)
  })

  it('returns 0 when no wins', () => {
    expect(calculateAverageWinPct([-10, -20])).toBe(0)
  })
})

describe('calculateAverageLossPct', () => {
  it('returns average of losing returns only', () => {
    expect(calculateAverageLossPct([10, -5, 20, -15])).toBe(-10)
  })

  it('returns 0 when no losses', () => {
    expect(calculateAverageLossPct([10, 20])).toBe(0)
  })
})

describe('calculateProfitLossRatio', () => {
  it('returns correct ratio', () => {
    expect(calculateProfitLossRatio(15, -10)).toBe(1.5)
  })

  it('returns 0 when avg loss is 0', () => {
    expect(calculateProfitLossRatio(15, 0)).toBe(0)
  })
})

describe('calculateConsensusMetrics', () => {
  it('returns all zero metrics for empty array', () => {
    const result = calculateConsensusMetrics([])
    expect(result.averageReturnPct).toBe(0)
    expect(result.followerCount).toBe(0)
  })

  it('calculates all metrics correctly', () => {
    const returns = [10, -5, 20, 15, -10]
    const result = calculateConsensusMetrics(returns)

    expect(result.averageReturnPct).toBe(6)
    expect(result.medianReturnPct).toBe(10)
    expect(result.maxReturnPct).toBe(20)
    expect(result.minReturnPct).toBe(-10)
    expect(result.winRate).toBe(60)
    expect(result.followerCount).toBe(5)
  })
})
