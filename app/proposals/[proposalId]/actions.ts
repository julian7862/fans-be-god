'use server'

import { createClient } from '@/lib/supabase/server'
import {
  addBullPoint,
  deleteBullPoint,
  updateBullPoint,
  addRiskPoint,
  deleteRiskPoint,
  updateRiskPoint,
  addComment,
  updateComment,
  deleteComment,
  assignBearReviewer,
} from '@/lib/discussion/service'
import { updateProposal } from '@/lib/proposal/service'
import { updateProposalSchema } from '@/lib/validation/proposalSchema'
import { submitScore, type ScoreInput } from '@/lib/scoring/service'
import { submitVote } from '@/lib/scoring/service'
import { approveProposal } from '@/lib/consensus/service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { RiskSeverity, CommentType, VoteValue } from '@/types/proposal'

export async function addBullPointAction(proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const content = formData.get('content') as string
  const category = (formData.get('category') as string) || undefined

  if (!content || content.trim().length === 0) {
    return { error: '請輸入看多理由' }
  }

  const result = await addBullPoint(proposalId, user.id, content.trim(), category)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function updateBullPointAction(bullPointId: string, proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const content = formData.get('content') as string
  const category = (formData.get('category') as string) || undefined

  if (!content || content.trim().length === 0) {
    return { error: '請輸入看多理由' }
  }

  const result = await updateBullPoint(bullPointId, user.id, content.trim(), category)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function deleteBullPointAction(bullPointId: string, proposalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const result = await deleteBullPoint(bullPointId, user.id)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function addRiskPointAction(proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const content = formData.get('content') as string
  const category = (formData.get('category') as string) || undefined
  const severity = (formData.get('severity') as RiskSeverity) || 'medium'

  if (!content || content.trim().length === 0) {
    return { error: '請輸入風險提醒' }
  }

  const result = await addRiskPoint(proposalId, user.id, content.trim(), category, severity)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function updateRiskPointAction(riskPointId: string, proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const content = formData.get('content') as string
  const severity = (formData.get('severity') as RiskSeverity) || 'medium'

  if (!content || content.trim().length === 0) {
    return { error: '請輸入風險提醒' }
  }

  const result = await updateRiskPoint(riskPointId, user.id, content.trim(), severity)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function deleteRiskPointAction(riskPointId: string, proposalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const result = await deleteRiskPoint(riskPointId, user.id)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function addCommentAction(proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const content = formData.get('content') as string
  const commentType = (formData.get('commentType') as CommentType) || 'general'

  if (!content || content.trim().length === 0) {
    return { error: '請輸入留言內容' }
  }

  const result = await addComment(proposalId, user.id, content.trim(), commentType)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function updateCommentAction(commentId: string, proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const content = formData.get('content') as string

  if (!content || content.trim().length === 0) {
    return { error: '請輸入留言內容' }
  }

  const result = await updateComment(commentId, user.id, content.trim())
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function deleteCommentAction(commentId: string, proposalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const result = await deleteComment(commentId, user.id)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function assignBearReviewerAction(proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const bearReviewerId = formData.get('bearReviewerId') as string
  if (!bearReviewerId) return { error: '請選擇反方成員' }

  const result = await assignBearReviewer(proposalId, bearReviewerId, user.id)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function submitScoreAction(proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const scores: ScoreInput = {
    fundamental_score: Number(formData.get('fundamental_score')) || 10,
    industry_score: Number(formData.get('industry_score')) || 10,
    valuation_score: Number(formData.get('valuation_score')) || 10,
    risk_control_score: Number(formData.get('risk_control_score')) || 10,
    plan_score: Number(formData.get('plan_score')) || 10,
  }

  const result = await submitScore(proposalId, user.id, scores)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function submitVoteAction(proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const vote = formData.get('vote') as VoteValue
  const reason = (formData.get('reason') as string) || undefined

  if (!vote) return { error: '請選擇投票選項' }

  const result = await submitVote(proposalId, user.id, vote, reason)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function updateProposalAction(proposalId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const toNum = (v: FormDataEntryValue | null) => {
    if (!v || v === '') return undefined
    const n = Number(v)
    return isNaN(n) ? undefined : n
  }

  const raw = {
    ticker: formData.get('ticker') || undefined,
    stockName: formData.get('stockName') || undefined,
    market: formData.get('market') || undefined,
    proposalPrice: toNum(formData.get('proposalPrice')),
    investmentThesis: formData.get('investmentThesis') || undefined,
    targetPrice: toNum(formData.get('targetPrice')),
    stopLossPrice: toNum(formData.get('stopLossPrice')),
    exitCondition: formData.get('exitCondition') || undefined,
    expectedHoldingDays: toNum(formData.get('expectedHoldingDays')),
  }

  const parsed = updateProposalSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: '輸入資料驗證失敗' }
  }

  const { stockName, proposalPrice, investmentThesis, targetPrice, stopLossPrice, exitCondition, expectedHoldingDays, ...rest } = parsed.data
  const updates = {
    ...rest,
    ...(stockName !== undefined && { stock_name: stockName }),
    ...(proposalPrice !== undefined && { proposal_price: proposalPrice }),
    ...(investmentThesis !== undefined && { investment_thesis: investmentThesis }),
    ...(targetPrice !== undefined && { target_price: targetPrice }),
    ...(stopLossPrice !== undefined && { stop_loss_price: stopLossPrice }),
    ...(exitCondition !== undefined && { exit_condition: exitCondition }),
    ...(expectedHoldingDays !== undefined && { expected_holding_days: expectedHoldingDays }),
  }

  const result = await updateProposal(proposalId, user.id, updates)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}

export async function approveProposalAction(proposalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const result = await approveProposal(proposalId, user.id)
  if (!result.success) return { error: result.error }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}
