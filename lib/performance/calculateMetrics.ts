export function calculateGroupAverageReturnPct(memberReturns: number[]): number {
  if (memberReturns.length === 0) return 0
  const total = memberReturns.reduce((sum, r) => sum + r, 0)
  return total / memberReturns.length
}

export function calculateMedianReturnPct(memberReturns: number[]): number {
  if (memberReturns.length === 0) return 0
  const sorted = [...memberReturns].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

export function calculateWinRate(memberReturns: number[]): number {
  if (memberReturns.length === 0) return 0
  const wins = memberReturns.filter(r => r > 0).length
  return (wins / memberReturns.length) * 100
}

export function calculateAverageWinPct(memberReturns: number[]): number {
  const wins = memberReturns.filter(r => r > 0)
  if (wins.length === 0) return 0
  return wins.reduce((sum, r) => sum + r, 0) / wins.length
}

export function calculateAverageLossPct(memberReturns: number[]): number {
  const losses = memberReturns.filter(r => r < 0)
  if (losses.length === 0) return 0
  return losses.reduce((sum, r) => sum + r, 0) / losses.length
}

export function calculateProfitLossRatio(avgWinPct: number, avgLossPct: number): number {
  if (avgLossPct === 0) return 0
  return avgWinPct / Math.abs(avgLossPct)
}

export type ConsensusMetrics = {
  averageReturnPct: number
  medianReturnPct: number
  maxReturnPct: number
  minReturnPct: number
  winRate: number
  followerCount: number
}

export function calculateConsensusMetrics(memberReturns: number[]): ConsensusMetrics {
  if (memberReturns.length === 0) {
    return {
      averageReturnPct: 0,
      medianReturnPct: 0,
      maxReturnPct: 0,
      minReturnPct: 0,
      winRate: 0,
      followerCount: 0,
    }
  }

  return {
    averageReturnPct: calculateGroupAverageReturnPct(memberReturns),
    medianReturnPct: calculateMedianReturnPct(memberReturns),
    maxReturnPct: Math.max(...memberReturns),
    minReturnPct: Math.min(...memberReturns),
    winRate: calculateWinRate(memberReturns),
    followerCount: memberReturns.length,
  }
}
