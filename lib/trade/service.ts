import { createClient } from '@/lib/supabase/server'
import type { ConsensusStock, TradeRecord } from '@/types/trade'
import { calculateSingleReturnPct } from '@/lib/performance/calculateReturn'

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─── Consensus Stocks ───────────────────────────────────────────

export async function getConsensusStocksForGroup(
  groupId: string
): Promise<Result<ConsensusStock[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consensus_stocks')
    .select('*')
    .eq('group_id', groupId)
    .order('consensus_date', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data ?? [] }
}

export async function getConsensusStockById(
  consensusStockId: string
): Promise<Result<ConsensusStock>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consensus_stocks')
    .select('*')
    .eq('id', consensusStockId)
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

// ─── Trade Records ──────────────────────────────────────────────

export type TradeRecordWithUser = TradeRecord & {
  users: { display_name: string }
}

export async function getTradeRecordsForConsensus(
  consensusStockId: string
): Promise<Result<TradeRecordWithUser[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('trade_records')
    .select('*, users(display_name)')
    .eq('consensus_stock_id', consensusStockId)
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data as TradeRecordWithUser[] }
}

export async function getMyTradeRecord(
  consensusStockId: string,
  userId: string
): Promise<Result<TradeRecord | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('trade_records')
    .select('*')
    .eq('consensus_stock_id', consensusStockId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function followConsensusStock(
  consensusStockId: string,
  groupId: string,
  userId: string
): Promise<Result<TradeRecord>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('trade_records')
    .select('id')
    .eq('consensus_stock_id', consensusStockId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) return { success: false, error: '你已經建立此標的的交易紀錄' }

  const { data, error } = await supabase
    .from('trade_records')
    .insert({
      consensus_stock_id: consensusStockId,
      group_id: groupId,
      user_id: userId,
      followed: true,
      status: 'holding',
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function recordBuy(
  tradeId: string,
  userId: string,
  input: { buyDate: string; buyPrice: number; quantity: number; investedAmount: number }
): Promise<Result<TradeRecord>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('trade_records')
    .select('user_id')
    .eq('id', tradeId)
    .single()

  if (!existing) return { success: false, error: '找不到交易紀錄' }
  if (existing.user_id !== userId) return { success: false, error: '只能編輯自己的交易紀錄' }

  const { data, error } = await supabase
    .from('trade_records')
    .update({
      buy_date: input.buyDate,
      buy_price: input.buyPrice,
      quantity: input.quantity,
      invested_amount: input.investedAmount,
      status: 'holding',
    })
    .eq('id', tradeId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function recordSell(
  tradeId: string,
  userId: string,
  input: { sellDate: string; sellPrice: number }
): Promise<Result<TradeRecord>> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('trade_records')
    .select('user_id, buy_price')
    .eq('id', tradeId)
    .single()

  if (!existing) return { success: false, error: '找不到交易紀錄' }
  if (existing.user_id !== userId) return { success: false, error: '只能編輯自己的交易紀錄' }

  const buyPrice = existing.buy_price
  const returnPct = buyPrice ? calculateSingleReturnPct(buyPrice, input.sellPrice) : null
  const holdingDays = existing.buy_price ? undefined : undefined // will calculate from dates if needed

  const { data, error } = await supabase
    .from('trade_records')
    .update({
      sell_date: input.sellDate,
      sell_price: input.sellPrice,
      realized_return_pct: returnPct,
      final_return_pct: returnPct,
      status: 'closed',
    })
    .eq('id', tradeId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}
