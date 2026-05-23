import { describe, it, expect } from 'vitest'
import { computeVoteOutcome } from '@/lib/consensus/voteHelpers'

const base = {
  agreeThreshold: 0.6,
  scoreThreshold: 60,
  maxVotes: 5,
}

describe('computeVoteOutcome', () => {
  // ── 自動觸發：任一方過半 ──────────────────────────────────────────

  it('同意票過半立即觸發並通過', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'agree', 'agree', 'disagree'],  // 3/4 > 50%
      scores: [80, 70, 75, 60],
      forceByAdmin: false,
    })
    expect(result.triggered).toBe(true)
    expect(result.passed).toBe(true)
    expect(result.agreeRatio).toBeCloseTo(0.75)
  })

  it('反對票過半立即觸發並不通過', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['disagree', 'disagree', 'disagree', 'agree'],  // 3/4 disagree > 50%
      scores: [80, 70, 75, 60],
      forceByAdmin: false,
    })
    expect(result.triggered).toBe(true)
    expect(result.passed).toBe(false)
  })

  it('未過半且未達 maxVotes，不觸發', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'disagree'],  // 1:1, 無過半
      scores: [80, 60],
      forceByAdmin: false,
    })
    expect(result.triggered).toBe(false)
  })

  // ── 自動觸發：達到 maxVotes ──────────────────────────────────────

  it('達到 5 票觸發，同意多則通過', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'agree', 'agree', 'disagree', 'disagree'],
      scores: [70, 65, 80, 60, 75],
      forceByAdmin: false,
    })
    expect(result.triggered).toBe(true)
    expect(result.agreeRatio).toBeCloseTo(0.6)
    expect(result.passed).toBe(true)
  })

  it('達到 5 票觸發，反對多則不通過', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'disagree', 'disagree', 'disagree', 'agree'],
      scores: [70, 65, 80, 60, 75],
      forceByAdmin: false,
    })
    expect(result.triggered).toBe(true)
    expect(result.passed).toBe(false)
  })

  // ── 手動觸發（forceByAdmin: true）────────────────────────────────

  it('forceByAdmin 只有 2 票也觸發', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['agree', 'agree'],
      scores: [80, 70],
      forceByAdmin: true,
    })
    expect(result.triggered).toBe(true)
    expect(result.passed).toBe(true)
  })

  it('forceByAdmin 且同意率不足仍不通過', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['disagree', 'disagree'],
      scores: [30, 40],
      forceByAdmin: true,
    })
    expect(result.triggered).toBe(true)
    expect(result.passed).toBe(false)
  })

  // ── 忽略非 agree/disagree 票 ────────────────────────────────────

  it('need_more_info 和 watch_later 不計入票數', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: ['need_more_info', 'watch_later', 'agree', 'agree', 'agree', 'disagree'],
      scores: [80, 70, 75, 65, 80, 60],
      forceByAdmin: false,
    })
    // 有效票：4 票（3 agree + 1 disagree），3/4 > 50%
    expect(result.triggered).toBe(true)
    expect(result.passed).toBe(true)
    expect(result.agreeCount).toBe(3)
    expect(result.disagreeCount).toBe(1)
  })

  // ── Edge cases ───────────────────────────────────────────────────

  it('無投票不觸發', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: [],
      scores: [],
      forceByAdmin: false,
    })
    expect(result.triggered).toBe(false)
    expect(result.agreeRatio).toBe(0)
  })

  it('forceByAdmin 無投票也觸發但不通過', () => {
    const result = computeVoteOutcome({
      ...base,
      votes: [],
      scores: [],
      forceByAdmin: true,
    })
    expect(result.triggered).toBe(true)
    expect(result.passed).toBe(false)
  })
})
