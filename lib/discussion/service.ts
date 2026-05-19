import { createClient } from '@/lib/supabase/server'
import type { ProposalBullPoint, ProposalRiskPoint, ProposalComment, RiskSeverity, BullPointCategory, CommentType } from '@/types/proposal'

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── Bull Points ────────────────────────────────────────────────

export async function addBullPoint(
  proposalId: string,
  userId: string,
  content: string,
  category?: string
): Promise<Result<ProposalBullPoint>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_bull_points')
    .insert({
      proposal_id: proposalId,
      user_id: userId,
      content,
      category: category ?? null,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getBullPoints(
  proposalId: string
): Promise<Result<(ProposalBullPoint & { users: { display_name: string } })[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_bull_points')
    .select('*, users(display_name)')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as (ProposalBullPoint & { users: { display_name: string } })[] }
}

export async function updateBullPoint(
  bullPointId: string,
  userId: string,
  content: string,
  category?: string | null
): Promise<Result<ProposalBullPoint>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('proposal_bull_points')
    .select('user_id')
    .eq('id', bullPointId)
    .single()

  if (!existing) return { success: false, error: '找不到此看多理由' }
  if (existing.user_id !== userId) return { success: false, error: '只能編輯自己的看多理由' }

  const { data, error } = await supabase
    .from('proposal_bull_points')
    .update({ content, category: category ?? null })
    .eq('id', bullPointId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function deleteBullPoint(
  bullPointId: string,
  userId: string
): Promise<Result<{ message: string }>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('proposal_bull_points')
    .select('user_id')
    .eq('id', bullPointId)
    .single()

  if (!existing) return { success: false, error: '找不到此看多理由' }
  if (existing.user_id !== userId) return { success: false, error: '只能刪除自己的看多理由' }

  const { error } = await supabase
    .from('proposal_bull_points')
    .delete()
    .eq('id', bullPointId)

  if (error) return { success: false, error: error.message }
  return { success: true, data: { message: '已刪除' } }
}

// ─── Risk Points ────────────────────────────────────────────────

export async function addRiskPoint(
  proposalId: string,
  userId: string,
  content: string,
  category?: string,
  severity?: RiskSeverity
): Promise<Result<ProposalRiskPoint>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_risk_points')
    .insert({
      proposal_id: proposalId,
      user_id: userId,
      content,
      category: category ?? null,
      severity: severity ?? 'medium',
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getRiskPoints(
  proposalId: string
): Promise<Result<(ProposalRiskPoint & { users: { display_name: string } })[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_risk_points')
    .select('*, users(display_name)')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as (ProposalRiskPoint & { users: { display_name: string } })[] }
}

export async function updateRiskPoint(
  riskPointId: string,
  userId: string,
  content: string,
  severity?: RiskSeverity
): Promise<Result<ProposalRiskPoint>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('proposal_risk_points')
    .select('user_id')
    .eq('id', riskPointId)
    .single()

  if (!existing) return { success: false, error: '找不到此風險提醒' }
  if (existing.user_id !== userId) return { success: false, error: '只能編輯自己的風險提醒' }

  const { data, error } = await supabase
    .from('proposal_risk_points')
    .update({ content, severity: severity ?? 'medium' })
    .eq('id', riskPointId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function deleteRiskPoint(
  riskPointId: string,
  userId: string
): Promise<Result<{ message: string }>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('proposal_risk_points')
    .select('user_id')
    .eq('id', riskPointId)
    .single()

  if (!existing) return { success: false, error: '找不到此風險提醒' }
  if (existing.user_id !== userId) return { success: false, error: '只能刪除自己的風險提醒' }

  const { error } = await supabase
    .from('proposal_risk_points')
    .delete()
    .eq('id', riskPointId)

  if (error) return { success: false, error: error.message }
  return { success: true, data: { message: '已刪除' } }
}

// ─── Comments ───────────────────────────────────────────────────

export async function addComment(
  proposalId: string,
  userId: string,
  content: string,
  commentType?: CommentType
): Promise<Result<ProposalComment>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_comments')
    .insert({
      proposal_id: proposalId,
      user_id: userId,
      content,
      comment_type: commentType ?? 'general',
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<Result<ProposalComment>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('proposal_comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!existing) return { success: false, error: '找不到此留言' }
  if (existing.user_id !== userId) return { success: false, error: '只能編輯自己的留言' }

  const { data, error } = await supabase
    .from('proposal_comments')
    .update({ content })
    .eq('id', commentId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<Result<{ message: string }>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('proposal_comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!existing) return { success: false, error: '找不到此留言' }
  if (existing.user_id !== userId) return { success: false, error: '只能刪除自己的留言' }

  const { error } = await supabase
    .from('proposal_comments')
    .delete()
    .eq('id', commentId)

  if (error) return { success: false, error: error.message }
  return { success: true, data: { message: '已刪除' } }
}

export async function getComments(
  proposalId: string
): Promise<Result<(ProposalComment & { users: { display_name: string } })[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_comments')
    .select('*, users(display_name)')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as (ProposalComment & { users: { display_name: string } })[] }
}

// ─── Bear Reviewer ──────────────────────────────────────────────

export async function assignBearReviewer(
  proposalId: string,
  bearReviewerId: string,
  assignerUserId: string
): Promise<Result<{ message: string }>> {
  const supabase = await createClient()

  const { data: proposal } = await supabase
    .from('stock_proposals')
    .select('group_id, proposer_id')
    .eq('id', proposalId)
    .single()

  if (!proposal) return { success: false, error: '找不到此提案' }

  if (bearReviewerId === proposal.proposer_id) {
    return { success: false, error: '提案人不可擔任自己提案的反方' }
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', proposal.group_id)
    .eq('user_id', assignerUserId)
    .single()

  if (!membership || !['owner', 'admin', 'member'].includes(membership.role)) {
    return { success: false, error: '你沒有權限指定反方' }
  }

  const { data: bearMembership } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', proposal.group_id)
    .eq('user_id', bearReviewerId)
    .single()

  if (!bearMembership) {
    return { success: false, error: '被指定的反方必須是小組成員' }
  }

  const { error } = await supabase
    .from('stock_proposals')
    .update({ bear_reviewer_id: bearReviewerId })
    .eq('id', proposalId)

  if (error) return { success: false, error: error.message }
  return { success: true, data: { message: '已指定反方審查者' } }
}

// ─── Risk Sufficiency Check ─────────────────────────────────────

export async function checkRiskSufficiency(
  proposalId: string
): Promise<Result<{ sufficient: boolean; bullCount: number; riskCount: number; minRiskRequired: number }>> {
  const supabase = await createClient()

  const { data: proposal } = await supabase
    .from('stock_proposals')
    .select('group_id')
    .eq('id', proposalId)
    .single()

  if (!proposal) return { success: false, error: '找不到此提案' }

  const { data: group } = await supabase
    .from('groups')
    .select('min_risk_points, min_bull_points')
    .eq('id', proposal.group_id)
    .single()

  if (!group) return { success: false, error: '找不到小組設定' }

  const { count: bullCount } = await supabase
    .from('proposal_bull_points')
    .select('*', { count: 'exact', head: true })
    .eq('proposal_id', proposalId)

  const { count: riskCount } = await supabase
    .from('proposal_risk_points')
    .select('*', { count: 'exact', head: true })
    .eq('proposal_id', proposalId)

  return {
    success: true,
    data: {
      sufficient: (riskCount ?? 0) >= group.min_risk_points,
      bullCount: bullCount ?? 0,
      riskCount: riskCount ?? 0,
      minRiskRequired: group.min_risk_points,
    },
  }
}
