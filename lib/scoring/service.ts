import { createClient } from '@/lib/supabase/server'
import type { ProposalScore, ProposalVote, VoteValue } from '@/types/proposal'

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── Scores ─────────────────────────────────────────────────────

export type ScoreInput = {
  fundamental_score: number
  industry_score: number
  valuation_score: number
  risk_control_score: number
  plan_score: number
}

export async function submitScore(
  proposalId: string,
  userId: string,
  scores: ScoreInput
): Promise<Result<ProposalScore>> {
  const supabase = await createClient()

  for (const [key, val] of Object.entries(scores)) {
    if (val < 1 || val > 20) {
      return { success: false, error: `${key} 必須在 1-20 之間` }
    }
  }

  const { data, error } = await supabase
    .from('proposal_scores')
    .upsert(
      {
        proposal_id: proposalId,
        user_id: userId,
        ...scores,
      },
      { onConflict: 'proposal_id,user_id' }
    )
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getScores(
  proposalId: string
): Promise<Result<(ProposalScore & { users: { display_name: string } })[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_scores')
    .select('*, users(display_name)')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as (ProposalScore & { users: { display_name: string } })[] }
}

export async function getMyScore(
  proposalId: string,
  userId: string
): Promise<Result<ProposalScore | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_scores')
    .select('*')
    .eq('proposal_id', proposalId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

// ─── Votes ──────────────────────────────────────────────────────

export async function submitVote(
  proposalId: string,
  userId: string,
  vote: VoteValue,
  reason?: string
): Promise<Result<ProposalVote>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_votes')
    .upsert(
      {
        proposal_id: proposalId,
        user_id: userId,
        vote,
        reason: reason ?? null,
      },
      { onConflict: 'proposal_id,user_id' }
    )
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getVotes(
  proposalId: string
): Promise<Result<(ProposalVote & { users: { display_name: string } })[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_votes')
    .select('*, users(display_name)')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as (ProposalVote & { users: { display_name: string } })[] }
}

export async function getMyVote(
  proposalId: string,
  userId: string
): Promise<Result<ProposalVote | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proposal_votes')
    .select('*')
    .eq('proposal_id', proposalId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}
