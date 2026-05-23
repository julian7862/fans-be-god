export type VoteOutcome = {
  triggered: boolean  // 是否達到判定條件
  passed: boolean
  agreeRatio: number
  agreeCount: number
  disagreeCount: number
}

// 觸發條件：任一方過半 OR 總票數 >= maxVotes（預設 5）
export function computeVoteOutcome({
  votes,
  scores,
  agreeThreshold,
  scoreThreshold,
  forceByAdmin,
  maxVotes = 5,
}: {
  votes: string[]
  scores: number[]
  agreeThreshold: number
  scoreThreshold: number
  forceByAdmin: boolean
  maxVotes?: number
}): VoteOutcome {
  const agreeCount = votes.filter(v => v === 'agree').length
  const disagreeCount = votes.filter(v => v === 'disagree').length
  const totalRelevantVotes = agreeCount + disagreeCount

  const agreeRatio = totalRelevantVotes === 0 ? 0 : agreeCount / totalRelevantVotes
  const averageScore = scores.length === 0
    ? 0
    : scores.reduce((sum, s) => sum + s, 0) / scores.length

  const majorityReached =
    agreeCount > totalRelevantVotes / 2 ||
    disagreeCount > totalRelevantVotes / 2

  const triggered = forceByAdmin || majorityReached || totalRelevantVotes >= maxVotes

  if (!triggered) {
    return { triggered: false, passed: false, agreeRatio, agreeCount, disagreeCount }
  }

  const passed =
    agreeRatio >= agreeThreshold &&
    averageScore >= scoreThreshold

  return { triggered: true, passed, agreeRatio, agreeCount, disagreeCount }
}
