export type GroupRole = 'owner' | 'admin' | 'member' | 'viewer'

export type Group = {
  id: string
  name: string
  description: string | null
  owner_id: string
  consensus_agree_threshold: number
  consensus_score_threshold: number
  min_bull_points: number
  min_risk_points: number
  require_bear_reviewer: boolean
  created_at: string
  updated_at: string
}

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  role: GroupRole
  joined_at: string
}

export type GroupWithMemberCount = Group & {
  member_count: number
}

export type GroupMemberWithUser = GroupMember & {
  users: {
    display_name: string
    email: string
    avatar_url: string | null
  }
}
