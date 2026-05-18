import { createClient } from '@/lib/supabase/server'
import type { Review } from '@/types/performance'

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type ReviewInput = {
  thesisValid: boolean | null
  targetReached: boolean | null
  stopLossTriggered: boolean | null
  risksHappened: string
  correctJudgements: string
  wrongJudgements: string
  lessonLearned: string
  nextTimeImprovement: string
}

export async function createReview(
  consensusStockId: string,
  groupId: string,
  userId: string,
  input: ReviewInput
): Promise<Result<Review>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      consensus_stock_id: consensusStockId,
      group_id: groupId,
      thesis_valid: input.thesisValid,
      target_reached: input.targetReached,
      stop_loss_triggered: input.stopLossTriggered,
      risks_happened: input.risksHappened || null,
      correct_judgements: input.correctJudgements || null,
      wrong_judgements: input.wrongJudgements || null,
      lesson_learned: input.lessonLearned || null,
      next_time_improvement: input.nextTimeImprovement || null,
      created_by: userId,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getReviews(
  consensusStockId: string
): Promise<Result<(Review & { users: { display_name: string } })[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*, users:created_by(display_name)')
    .eq('consensus_stock_id', consensusStockId)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as (Review & { users: { display_name: string } })[] }
}
