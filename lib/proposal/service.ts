import { createClient } from '@/lib/supabase/server'
import type { StockProposal, ProposalStatus } from '@/types/proposal'

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createProposal(
  groupId: string,
  proposerId: string,
  input: {
    ticker: string
    stockName: string
    market?: string
    proposalPrice?: number
    investmentThesis: string
    targetPrice: number
    stopLossPrice?: number
    exitCondition?: string
    expectedHoldingDays?: number
  }
): Promise<Result<StockProposal>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stock_proposals')
    .insert({
      group_id: groupId,
      proposer_id: proposerId,
      ticker: input.ticker,
      stock_name: input.stockName,
      market: input.market ?? null,
      proposal_price: input.proposalPrice ?? null,
      investment_thesis: input.investmentThesis,
      target_price: input.targetPrice,
      stop_loss_price: input.stopLossPrice ?? null,
      exit_condition: input.exitCondition ?? null,
      expected_holding_days: input.expectedHoldingDays ?? null,
      status: 'submitted',
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getProposalsForGroup(
  groupId: string,
  statusFilter?: ProposalStatus
): Promise<Result<StockProposal[]>> {
  const supabase = await createClient()

  let query = supabase
    .from('stock_proposals')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) return { success: false, error: error.message }
  return { success: true, data: data ?? [] }
}

export async function getProposalById(
  proposalId: string
): Promise<Result<StockProposal>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stock_proposals')
    .select('*')
    .eq('id', proposalId)
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function updateProposal(
  proposalId: string,
  userId: string,
  updates: Partial<{
    ticker: string
    stock_name: string
    market: string | null
    proposal_price: number | null
    investment_thesis: string
    target_price: number | null
    stop_loss_price: number | null
    exit_condition: string | null
    expected_holding_days: number | null
  }>
): Promise<Result<StockProposal>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('stock_proposals')
    .select('proposer_id, status')
    .eq('id', proposalId)
    .single()

  if (!existing) return { success: false, error: '找不到此提案' }
  if (existing.proposer_id !== userId) return { success: false, error: '只有提案人可以編輯' }
  if (!['draft', 'submitted'].includes(existing.status)) {
    return { success: false, error: '此提案狀態下無法編輯' }
  }

  const { data, error } = await supabase
    .from('stock_proposals')
    .update(updates)
    .eq('id', proposalId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

const validTransitions: Record<string, ProposalStatus[]> = {
  draft: ['submitted'],
  submitted: ['discussion'],
  discussion: ['risk_insufficient', 'bear_review', 'voting'],
  risk_insufficient: ['discussion'],
  bear_review: ['voting'],
  voting: ['approved', 'rejected', 'watchlist'],
  approved: ['closed'],
  rejected: ['closed'],
  watchlist: ['discussion', 'closed'],
  closed: [],
}

export async function updateProposalStatus(
  proposalId: string,
  newStatus: ProposalStatus,
  userId: string
): Promise<Result<StockProposal>> {
  const supabase = await createClient()

  const { data: proposal } = await supabase
    .from('stock_proposals')
    .select('status, group_id')
    .eq('id', proposalId)
    .single()

  if (!proposal) return { success: false, error: '找不到此提案' }

  const allowed = validTransitions[proposal.status] ?? []
  if (!allowed.includes(newStatus)) {
    return { success: false, error: `無法從 ${proposal.status} 轉換到 ${newStatus}` }
  }

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', proposal.group_id)
    .eq('user_id', userId)
    .single()

  if (!membership) return { success: false, error: '你不是此小組的成員' }

  const { data, error } = await supabase
    .from('stock_proposals')
    .update({ status: newStatus })
    .eq('id', proposalId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function deleteProposal(
  proposalId: string,
  userId: string
): Promise<Result<{ message: string }>> {
  const supabase = await createClient()

  const { data: proposal } = await supabase
    .from('stock_proposals')
    .select('proposer_id, status')
    .eq('id', proposalId)
    .single()

  if (!proposal) return { success: false, error: '找不到此提案' }
  if (proposal.proposer_id !== userId) return { success: false, error: '只有提案人可以刪除' }
  if (!['draft', 'submitted'].includes(proposal.status)) {
    return { success: false, error: '此提案狀態下無法刪除' }
  }

  const { error } = await supabase
    .from('stock_proposals')
    .delete()
    .eq('id', proposalId)

  if (error) return { success: false, error: error.message }
  return { success: true, data: { message: '提案已刪除' } }
}
