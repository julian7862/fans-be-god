import { createClient } from '@/lib/supabase/server'
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
