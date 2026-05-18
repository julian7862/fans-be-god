import { createClient } from '@/lib/supabase/server'
import { calculateGroupAverageReturnPct, calculateMedianReturnPct, calculateWinRate } from './calculateMetrics'

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type GroupPerformanceSummary = {
  totalConsensusStocks: number
  activeStocks: number
  closedStocks: number
  groupAverageReturnPct: number
  groupMedianReturnPct: number
  groupWinRate: number
  totalFollowers: number
}

export async function getGroupPerformance(groupId: string): Promise<Result<GroupPerformanceSummary>> {
  const supabase = await createClient()

  const { data: stocks } = await supabase
    .from('consensus_stocks')
    .select('id, status')
    .eq('group_id', groupId)

  if (!stocks || stocks.length === 0) {
    return {
      success: true,
      data: {
        totalConsensusStocks: 0, activeStocks: 0, closedStocks: 0,
        groupAverageReturnPct: 0, groupMedianReturnPct: 0, groupWinRate: 0, totalFollowers: 0,
      },
    }
  }

  const { data: trades } = await supabase
    .from('trade_records')
    .select('final_return_pct, status')
    .eq('group_id', groupId)

  const closedReturns = (trades ?? [])
    .filter(t => t.final_return_pct !== null)
    .map(t => t.final_return_pct as number)

  return {
    success: true,
    data: {
      totalConsensusStocks: stocks.length,
      activeStocks: stocks.filter(s => s.status === 'active').length,
      closedStocks: stocks.filter(s => s.status === 'closed').length,
      groupAverageReturnPct: calculateGroupAverageReturnPct(closedReturns),
      groupMedianReturnPct: calculateMedianReturnPct(closedReturns),
      groupWinRate: calculateWinRate(closedReturns),
      totalFollowers: trades?.length ?? 0,
    },
  }
}

export type MemberRanking = {
  userId: string
  displayName: string
  averageReturnPct: number
  winRate: number
  tradeCount: number
}

export async function getMemberRankings(groupId: string): Promise<Result<MemberRanking[]>> {
  const supabase = await createClient()

  const { data: trades } = await supabase
    .from('trade_records')
    .select('user_id, final_return_pct, users(display_name)')
    .eq('group_id', groupId)
    .not('final_return_pct', 'is', null)

  if (!trades || trades.length === 0) return { success: true, data: [] }

  const memberMap = new Map<string, { displayName: string; returns: number[] }>()

  for (const trade of trades) {
    const uid = trade.user_id
    const existing = memberMap.get(uid)
    const name = (trade.users as unknown as { display_name: string })?.display_name ?? ''
    if (existing) {
      existing.returns.push(trade.final_return_pct as number)
    } else {
      memberMap.set(uid, { displayName: name, returns: [trade.final_return_pct as number] })
    }
  }

  const rankings: MemberRanking[] = []
  for (const [userId, data] of memberMap) {
    if (data.returns.length < 3) continue
    rankings.push({
      userId,
      displayName: data.displayName,
      averageReturnPct: calculateGroupAverageReturnPct(data.returns),
      winRate: calculateWinRate(data.returns),
      tradeCount: data.returns.length,
    })
  }

  rankings.sort((a, b) => b.averageReturnPct - a.averageReturnPct)
  return { success: true, data: rankings }
}

export type ConsensusStockRanking = {
  consensusStockId: string
  ticker: string
  stockName: string
  averageReturnPct: number
  followerCount: number
}

export async function getConsensusStockRankings(groupId: string): Promise<Result<ConsensusStockRanking[]>> {
  const supabase = await createClient()

  const { data: stocks } = await supabase
    .from('consensus_stocks')
    .select('id, ticker, stock_name')
    .eq('group_id', groupId)

  if (!stocks || stocks.length === 0) return { success: true, data: [] }

  const { data: trades } = await supabase
    .from('trade_records')
    .select('consensus_stock_id, final_return_pct')
    .eq('group_id', groupId)
    .not('final_return_pct', 'is', null)

  if (!trades || trades.length === 0) return { success: true, data: [] }

  const stockMap = new Map<string, number[]>()
  for (const trade of trades) {
    const existing = stockMap.get(trade.consensus_stock_id)
    if (existing) {
      existing.push(trade.final_return_pct as number)
    } else {
      stockMap.set(trade.consensus_stock_id, [trade.final_return_pct as number])
    }
  }

  const rankings: ConsensusStockRanking[] = []
  for (const stock of stocks) {
    const returns = stockMap.get(stock.id)
    if (!returns || returns.length < 2) continue
    rankings.push({
      consensusStockId: stock.id,
      ticker: stock.ticker,
      stockName: stock.stock_name,
      averageReturnPct: calculateGroupAverageReturnPct(returns),
      followerCount: returns.length,
    })
  }

  rankings.sort((a, b) => b.averageReturnPct - a.averageReturnPct)
  return { success: true, data: rankings }
}
