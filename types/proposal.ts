export type ProposalStatus =
  | 'draft'
  | 'submitted'
  | 'discussion'
  | 'risk_insufficient'
  | 'bear_review'
  | 'voting'
  | 'approved'
  | 'rejected'
  | 'watchlist'
  | 'closed'

export type StockProposal = {
  id: string
  group_id: string
  proposer_id: string
  ticker: string
  stock_name: string
  market: string | null
  proposal_price: number | null
  proposal_date: string
  investment_thesis: string
  target_price: number | null
  stop_loss_price: number | null
  exit_condition: string | null
  expected_holding_days: number | null
  status: ProposalStatus
  bear_reviewer_id: string | null
  created_at: string
  updated_at: string
}

export type BullPointCategory =
  | 'fundamental'
  | 'industry_trend'
  | 'valuation'
  | 'technical'
  | 'chip'
  | 'news'
  | 'other'

export type ProposalBullPoint = {
  id: string
  proposal_id: string
  user_id: string
  content: string
  category: BullPointCategory | null
  created_at: string
}

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical'

export type ProposalRiskPoint = {
  id: string
  proposal_id: string
  user_id: string
  content: string
  category: string | null
  severity: RiskSeverity
  happened: boolean
  happened_note: string | null
  created_at: string
  updated_at: string
}

export type CommentType =
  | 'general'
  | 'question'
  | 'bear_argument'
  | 'clarification'
  | 'follow_up'

export type ProposalComment = {
  id: string
  proposal_id: string
  user_id: string
  content: string
  comment_type: CommentType
  created_at: string
}

export type ProposalScore = {
  id: string
  proposal_id: string
  user_id: string
  fundamental_score: number
  industry_score: number
  valuation_score: number
  risk_control_score: number
  plan_score: number
  total_score: number
  created_at: string
  updated_at: string
}

export type VoteValue = 'agree' | 'disagree' | 'need_more_info' | 'watch_later'

export type ProposalVote = {
  id: string
  proposal_id: string
  user_id: string
  vote: VoteValue
  reason: string | null
  created_at: string
  updated_at: string
}
