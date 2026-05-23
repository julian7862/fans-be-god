import { createClient } from '@/lib/supabase/server'
import { updateProposalStatus } from '@/lib/proposal/service'
import { computeVoteOutcome } from './voteHelpers'
import type { ConsensusCheckResult } from '@/types/performance'
import type { ConsensusStock } from '@/types/trade'

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function checkConsensusEligibility(
  proposalId: string
): Promise<Result<ConsensusCheckResult>> {
  const supabase = await createClient()

  const { data: proposal } = await supabase
    .from('stock_proposals')
    .select('*, groups(*)')
    .eq('id', proposalId)
    .single()

  if (!proposal) return { success: false, error: '找不到此提案' }

  const group = proposal.groups

  const { data: votes } = await supabase
    .from('proposal_votes')
    .select('vote')
    .eq('proposal_id', proposalId)

  const { data: scores } = await supabase
    .from('proposal_scores')
    .select('total_score')
    .eq('proposal_id', proposalId)

  const { count: bullCount } = await supabase
    .from('proposal_bull_points')
    .select('*', { count: 'exact', head: true })
    .eq('proposal_id', proposalId)

  const { count: riskCount } = await supabase
    .from('proposal_risk_points')
    .select('*', { count: 'exact', head: true })
    .eq('proposal_id', proposalId)

  const totalVotes = votes?.length ?? 0
  const agreeVotes = votes?.filter(v => v.vote === 'agree').length ?? 0
  const agreeRatio = totalVotes === 0 ? 0 : agreeVotes / totalVotes

  const scoreValues = scores?.map(s => s.total_score).filter((s): s is number => s !== null) ?? []
  const averageScore = scoreValues.length === 0
    ? 0
    : scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length

  const missingItems: string[] = []
  const warnings: string[] = []

  if (agreeRatio < group.consensus_agree_threshold) {
    missingItems.push(`同意比例未達門檻 (${(agreeRatio * 100).toFixed(0)}% < ${(group.consensus_agree_threshold * 100).toFixed(0)}%)`)
  }

  if (averageScore < group.consensus_score_threshold) {
    missingItems.push(`平均評分未達門檻 (${averageScore.toFixed(1)} < ${group.consensus_score_threshold})`)
  }

  if ((bullCount ?? 0) < group.min_bull_points) {
    missingItems.push(`看多理由不足 (${bullCount ?? 0} < ${group.min_bull_points})`)
  }

  if ((riskCount ?? 0) < group.min_risk_points) {
    missingItems.push(`風險提醒不足 (${riskCount ?? 0} < ${group.min_risk_points})`)
  }

  if (group.require_bear_reviewer && !proposal.bear_reviewer_id) {
    missingItems.push('尚未指定反方成員')
  }

  if (!proposal.investment_thesis) {
    missingItems.push('缺少買進邏輯')
  }

  if (!proposal.target_price) {
    missingItems.push('缺少目標價')
  }

  if (!proposal.stop_loss_price && !proposal.exit_condition) {
    missingItems.push('缺少停損價或退出條件')
  }

  if ((riskCount ?? 0) < group.min_risk_points && (bullCount ?? 0) >= group.min_bull_points) {
    warnings.push('目前討論偏向單邊樂觀，建議補充風險後再決策')
  }

  if (totalVotes === 0) {
    warnings.push('尚無投票')
  }

  if (scoreValues.length === 0) {
    warnings.push('尚無評分')
  }

  return {
    success: true,
    data: {
      passed: missingItems.length === 0,
      agreeRatio,
      averageScore,
      bullPointCount: bullCount ?? 0,
      riskPointCount: riskCount ?? 0,
      hasBearReviewer: Boolean(proposal.bear_reviewer_id),
      missingItems,
      warnings,
    },
  }
}

export async function approveProposal(
  proposalId: string,
  userId: string
): Promise<Result<ConsensusStock>> {
  const supabase = await createClient()

  const eligibility = await checkConsensusEligibility(proposalId)
  if (!eligibility.success) return { success: false, error: eligibility.error }
  if (!eligibility.data.passed) {
    return { success: false, error: '此提案尚未達成共識門檻' }
  }

  const { data: proposal } = await supabase
    .from('stock_proposals')
    .select('*')
    .eq('id', proposalId)
    .single()

  if (!proposal) return { success: false, error: '找不到此提案' }
  if (proposal.status === 'approved') {
    return { success: false, error: '此提案已核准，無法重複操作' }
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', proposal.group_id)
    .eq('user_id', userId)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { success: false, error: '只有 Owner 或 Admin 可以核准共識' }
  }

  const { error: statusError } = await supabase
    .from('stock_proposals')
    .update({ status: 'approved' })
    .eq('id', proposalId)

  if (statusError) return { success: false, error: statusError.message }

  const { data: consensusStock, error: insertError } = await supabase
    .from('consensus_stocks')
    .insert({
      proposal_id: proposalId,
      group_id: proposal.group_id,
      ticker: proposal.ticker,
      stock_name: proposal.stock_name,
      market: proposal.market,
      consensus_price: proposal.proposal_price,
      consensus_reason: proposal.investment_thesis,
      consensus_target_price: proposal.target_price,
      consensus_stop_loss_price: proposal.stop_loss_price,
      status: 'active',
    })
    .select()
    .single()

  if (insertError) return { success: false, error: insertError.message }
  return { success: true, data: consensusStock }
}

// ─── Vote Evaluation ────────────────────────────────────────────

export type VoteEvalResult = {
  allVoted: boolean
  passed: boolean
  rejected: boolean
  agreeRatio: number
  averageScore: number
}

export async function evaluateVoteResult(
  proposalId: string,
  userId: string,
  options: { forceByAdmin: boolean }
): Promise<Result<VoteEvalResult>> {
  const supabase = await createClient()

  const { data: proposal } = await supabase
    .from('stock_proposals')
    .select('*, groups(*)')
    .eq('id', proposalId)
    .single()

  if (!proposal) return { success: false, error: '找不到此提案' }
  if (proposal.status !== 'voting') {
    return { success: false, error: '提案不在投票狀態' }
  }

  const group = proposal.groups

  if (options.forceByAdmin) {
    const { data: membership } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', proposal.group_id)
      .eq('user_id', userId)
      .single()
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return { success: false, error: '只有 Owner 或 Admin 可以手動結束投票' }
    }
  }

  const { data: votes } = await supabase
    .from('proposal_votes')
    .select('vote')
    .eq('proposal_id', proposalId)

  const { data: scores } = await supabase
    .from('proposal_scores')
    .select('total_score')
    .eq('proposal_id', proposalId)

  let memberCount = Infinity
  if (!options.forceByAdmin) {
    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', proposal.group_id)
    memberCount = count ?? 0
  }

  const outcome = computeVoteOutcome({
    votes: votes?.map(v => v.vote) ?? [],
    scores: scores?.map(s => s.total_score).filter((s): s is number => s !== null) ?? [],
    memberCount,
    agreeThreshold: group.consensus_agree_threshold,
    scoreThreshold: group.consensus_score_threshold,
    forceByAdmin: options.forceByAdmin,
  })

  if (!outcome.allVoted) {
    return { success: true, data: { allVoted: false, passed: false, rejected: false, agreeRatio: outcome.agreeRatio, averageScore: outcome.averageScore } }
  }

  if (!outcome.passed) {
    await updateProposalStatus(proposalId, 'rejected', userId)
    return { success: true, data: { allVoted: true, passed: false, rejected: true, agreeRatio: outcome.agreeRatio, averageScore: outcome.averageScore } }
  }

  return { success: true, data: { allVoted: true, passed: true, rejected: false, agreeRatio: outcome.agreeRatio, averageScore: outcome.averageScore } }
}

// ─── Consensus Stock Close ───────────────────────────────────────

export async function closeConsensusStock(
  consensusStockId: string,
  userId: string,
  exitPrice: number,
  closeReason?: string
): Promise<Result<ConsensusStock>> {
  const supabase = await createClient()

  const { data: stock } = await supabase
    .from('consensus_stocks')
    .select('*')
    .eq('id', consensusStockId)
    .single()

  if (!stock) return { success: false, error: '找不到此共識股票' }
  if (!['active', 'watching'].includes(stock.status)) {
    return { success: false, error: '此共識股票已結案或已取消' }
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', stock.group_id)
    .eq('user_id', userId)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { success: false, error: '只有 Owner 或 Admin 可以結案' }
  }

  const { data: updated, error } = await supabase
    .from('consensus_stocks')
    .update({
      status: 'closed',
      exit_price: exitPrice,
      close_reason: closeReason ?? null,
      closed_at: new Date().toISOString(),
    })
    .eq('id', consensusStockId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  if (stock.proposal_id) {
    await updateProposalStatus(stock.proposal_id, 'closed', userId)
  }

  return { success: true, data: updated }
}
