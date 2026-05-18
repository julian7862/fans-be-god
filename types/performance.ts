export type ConsensusMetrics = {
  averageReturnPct: number
  medianReturnPct: number
  maxReturnPct: number
  minReturnPct: number
  winRate: number
  followerCount: number
}

export type MemberPerformance = {
  userId: string
  displayName: string
  averageReturnPct: number
  winRate: number
  totalTrades: number
  closedTrades: number
}

export type ConsensusCheckResult = {
  passed: boolean
  agreeRatio: number
  averageScore: number
  bullPointCount: number
  riskPointCount: number
  hasBearReviewer: boolean
  missingItems: string[]
  warnings: string[]
}

export type Review = {
  id: string
  consensus_stock_id: string
  group_id: string
  thesis_valid: boolean | null
  target_reached: boolean | null
  stop_loss_triggered: boolean | null
  risks_happened: string | null
  correct_judgements: string | null
  wrong_judgements: string | null
  lesson_learned: string | null
  next_time_improvement: string | null
  created_by: string
  created_at: string
  updated_at: string
}
