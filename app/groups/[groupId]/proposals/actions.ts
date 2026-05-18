'use server'

import { createClient } from '@/lib/supabase/server'
import { createProposal, updateProposalStatus } from '@/lib/proposal/service'
import { createProposalSchema } from '@/lib/validation/proposalSchema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ProposalStatus } from '@/types/proposal'

export async function createProposalAction(groupId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const raw = {
    ticker: formData.get('ticker'),
    stockName: formData.get('stockName'),
    market: formData.get('market') || undefined,
    proposalPrice: formData.get('proposalPrice') || undefined,
    investmentThesis: formData.get('investmentThesis'),
    targetPrice: formData.get('targetPrice'),
    stopLossPrice: formData.get('stopLossPrice') || undefined,
    exitCondition: formData.get('exitCondition') || undefined,
    expectedHoldingDays: formData.get('expectedHoldingDays') || undefined,
  }

  const parsed = createProposalSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const result = await createProposal(groupId, user.id, parsed.data)
  if (!result.success) return { error: result.error }

  revalidatePath(`/groups/${groupId}/proposals`)
  redirect(`/proposals/${result.data.id}`)
}

export async function updateProposalStatusAction(
  proposalId: string,
  newStatus: ProposalStatus,
  groupId: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const result = await updateProposalStatus(proposalId, newStatus, user.id)
  if (!result.success) return { error: result.error }

  revalidatePath(`/groups/${groupId}/proposals`)
  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}
