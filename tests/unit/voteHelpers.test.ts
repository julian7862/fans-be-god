import { describe, it, expect } from 'vitest'
import { computeVoteOutcome } from '@/lib/consensus/voteHelpers'

const base = {
  agreeThreshold: 0.6,
  scoreThreshold: 60,
}

describe('computeVoteOutcome', () => {
  // ── 自動觸發（forceByAdmin: false）──────────────────────────────

  it('未全員投票時回傳 allVoted: false，不判定結果', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'agree'],
      scores: [80, 70],
      memberCount: 5,
      forceByAdmin: false,
    })
    expect(result.allVoted).toBe(false)
    expect(result.passed).toBe(false)
  })

  it('全員投票且通過門檻回傳 passed: true', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'agree', 'agree', 'disagree', 'agree'],
      scores: [70, 65, 80, 60, 75],
      memberCount: 5,
      forceByAdmin: false,
    })
    expect(result.allVoted).toBe(true)
    expect(result.passed).toBe(true)
  })

  it('全員投票但同意比例不足回傳 passed: false', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'disagree', 'disagree', 'disagree', 'agree'],
      scores: [70, 65, 80, 60, 75],
      memberCount: 5,
      forceByAdmin: false,
    })
    expect(result.allVoted).toBe(true)
    expect(result.passed).toBe(false)
    expect(result.agreeRatio).toBeCloseTo(0.4)
  })

  it('全員投票但平均評分不足回傳 passed: false', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'agree', 'agree', 'agree', 'agree'],
      scores: [40, 50, 45, 55, 50],
      memberCount: 5,
      forceByAdmin: false,
    })
    expect(result.allVoted).toBe(true)
    expect(result.passed).toBe(false)
    expect(result.averageScore).toBe(48)
  })

  // ── 手動觸發（forceByAdmin: true）────────────────────────────────

  it('forceByAdmin 不檢查 memberCount，有投票就判定', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'agree'],
      scores: [80, 70],
      memberCount: 5,   // 只有 2 人投票，但 forceByAdmin
      forceByAdmin: true,
    })
    expect(result.allVoted).toBe(true)
    expect(result.passed).toBe(true)
  })

  it('forceByAdmin 且投票不通過仍回傳 passed: false', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['disagree', 'disagree'],
      scores: [30, 40],
      memberCount: 5,
      forceByAdmin: true,
    })
    expect(result.allVoted).toBe(true)
    expect(result.passed).toBe(false)
  })

  // ── Edge cases ───────────────────────────────────────────────────

  it('無投票記錄時 agreeRatio 為 0', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: [],
      scores: [],
      memberCount: 5,
      forceByAdmin: true,
    })
    expect(result.agreeRatio).toBe(0)
    expect(result.averageScore).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('正好達到門檻視為通過', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'agree', 'agree', 'disagree', 'disagree'],
      scores: [60, 60, 60, 60, 60],
      memberCount: 5,
      forceByAdmin: false,
    })
    expect(result.allVoted).toBe(true)
    expect(result.agreeRatio).toBeCloseTo(0.6)
    expect(result.averageScore).toBe(60)
    expect(result.passed).toBe(true)
  })
})
