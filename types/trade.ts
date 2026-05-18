export type TradeStatus = 'not_followed' | 'holding' | 'partial_sold' | 'closed'

export type TradeRecord = {
  id: string
  consensus_stock_id: string
  group_id: string
  user_id: string
  followed: boolean
  buy_date: string | null
  buy_price: number | null
  quantity: number | null
  invested_amount: number | null
  sell_date: string | null
  sell_price: number | null
  sell_quantity: number | null
  realized_pnl: number | null
  current_price: number | null
  unrealized_return_pct: number | null
  realized_return_pct: number | null
  final_return_pct: number | null
  holding_days: number | null
  followed_original_plan: boolean | null
  note: string | null
  status: TradeStatus
  created_at: string
  updated_at: string
}

export type TradeLotAction = 'buy' | 'sell'

export type TradeLot = {
  id: string
  trade_record_id: string
  action: TradeLotAction
  trade_date: string
  price: number
  quantity: number
  amount: number
  created_at: string
}

export type ConsensusStockStatus = 'active' | 'watching' | 'closed' | 'cancelled'

export type ConsensusStock = {
  id: string
  proposal_id: string
  group_id: string
  ticker: string
  stock_name: string
  market: string | null
  consensus_date: string
  consensus_price: number | null
  consensus_reason: string | null
  consensus_target_price: number | null
  consensus_stop_loss_price: number | null
  status: ConsensusStockStatus
  created_at: string
  updated_at: string
}
