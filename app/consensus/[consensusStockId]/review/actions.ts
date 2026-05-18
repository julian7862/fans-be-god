'use server'

import { createClient } from '@/lib/supabase/server'
import { createReview } from '@/lib/review/service'
import { revalidatePath } from 'next/cache'

export async function createReviewAction(consensusStockId: string, groupId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const thesisValidRaw = formData.get('thesisValid') as string
  const targetReachedRaw = formData.get('targetReached') as string
  const stopLossTriggeredRaw = formData.get('stopLossTriggered') as string

  const result = await createReview(consensusStockId, groupId, user.id, {
    thesisValid: thesisValidRaw === '' ? null : thesisValidRaw === 'true',
    targetReached: targetReachedRaw === '' ? null : targetReachedRaw === 'true',
    stopLossTriggered: stopLossTriggeredRaw === '' ? null : stopLossTriggeredRaw === 'true',
    risksHappened: formData.get('risksHappened') as string ?? '',
    correctJudgements: formData.get('correctJudgements') as string ?? '',
    wrongJudgements: formData.get('wrongJudgements') as string ?? '',
    lessonLearned: formData.get('lessonLearned') as string ?? '',
    nextTimeImprovement: formData.get('nextTimeImprovement') as string ?? '',
  })

  if (!result.success) return { error: result.error }

  revalidatePath(`/consensus/${consensusStockId}/review`)
  return { success: true }
}
