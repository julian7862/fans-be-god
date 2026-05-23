'use server'

import { createClient } from '@/lib/supabase/server'
import { followConsensusStock, recordBuy, recordSell } from '@/lib/trade/service'
import { closeConsensusStock } from '@/lib/consensus/service'
import { revalidatePath } from 'next/cache'

export async function closeConsensusStockAction(
  consensusStockId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const exitPriceRaw = formData.get('exitPrice')
  if (!exitPriceRaw || exitPriceRaw === '') return { error: '請填寫出場價格' }
  const exitPrice = Number(exitPriceRaw)
  if (isNaN(exitPrice) || exitPrice <= 0) return { error: '出場價格必須大於 0' }

  const closeReason = (formData.get('closeReason') as string) || undefined

  const result = await closeConsensusStock(consensusStockId, user.id, exitPrice, closeReason)
  if (!result.success) return { error: result.error }

  revalidatePath(`/consensus/${consensusStockId}`)
  return { success: true }
}

export async function followConsensusStockAction(consensusStockId: string, groupId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const result = await followConsensusStock(consensusStockId, groupId, user.id)
  if (!result.success) return { error: result.error }

  revalidatePath(`/consensus/${consensusStockId}`)
  return { success: true }
}

export async function recordBuyAction(consensusStockId: string, tradeId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const buyDate = formData.get('buyDate') as string
  const buyPrice = Number(formData.get('buyPrice'))
  const quantity = Number(formData.get('quantity'))
  const investedAmount = Number(formData.get('investedAmount'))

  if (!buyDate) return { error: '請選擇買進日期' }
  if (!buyPrice || buyPrice <= 0) return { error: '買進價格必須大於 0' }
  if (!quantity || quantity <= 0) return { error: '買進數量必須大於 0' }
  if (!investedAmount || investedAmount <= 0) return { error: '投入金額必須大於 0' }

  const result = await recordBuy(tradeId, user.id, { buyDate, buyPrice, quantity, investedAmount })
  if (!result.success) return { error: result.error }

  revalidatePath(`/consensus/${consensusStockId}`)
  revalidatePath(`/consensus/${consensusStockId}/trade`)
  return { success: true }
}

export async function recordSellAction(consensusStockId: string, tradeId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const sellDate = formData.get('sellDate') as string
  const sellPrice = Number(formData.get('sellPrice'))

  if (!sellDate) return { error: '請選擇賣出日期' }
  if (!sellPrice || sellPrice <= 0) return { error: '賣出價格必須大於 0' }

  const result = await recordSell(tradeId, user.id, { sellDate, sellPrice })
  if (!result.success) return { error: result.error }

  revalidatePath(`/consensus/${consensusStockId}`)
  revalidatePath(`/consensus/${consensusStockId}/trade`)
  return { success: true }
}
