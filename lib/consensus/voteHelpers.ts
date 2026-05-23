export type VoteOutcome = {
  allVoted: boolean
  passed: boolean
  agreeRatio: number
  averageScore: number
}

export function computeVoteOutcome({
  votes,
  scores,
  memberCount,
  agreeThreshold,
  scoreThreshold,
  forceByAdmin,
}: {
  votes: string[]          // array of vote values, e.g. ['agree', 'disagree']
  scores: number[]         // total_score values
  memberCount: number
  agreeThreshold: number   // e.g. 0.6
  scoreThreshold: number   // e.g. 60
  forceByAdmin: boolean
}): VoteOutcome {
  const totalVotes = votes.length
  const agreeVotes = votes.filter(v => v === 'agree').length
  const agreeRatio = totalVotes === 0 ? 0 : agreeVotes / totalVotes

  const averageScore = scores.length === 0
    ? 0
    : scores.reduce((sum, s) => sum + s, 0) / scores.length

  if (!forceByAdmin && totalVotes < memberCount) {
    return { allVoted: false, passed: false, agreeRatio, averageScore }
  }

  const passed = agreeRatio >= agreeThreshold && averageScore >= scoreThreshold
  return { allVoted: true, passed, agreeRatio, averageScore }
}
