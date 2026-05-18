import { Badge } from '@/components/ui/badge'
import type { ProposalStatus } from '@/types/proposal'

const statusConfig: Record<ProposalStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: '草稿', variant: 'outline' },
  submitted: { label: '已提交', variant: 'secondary' },
  discussion: { label: '討論中', variant: 'default' },
  risk_insufficient: { label: '風險不足', variant: 'destructive' },
  bear_review: { label: '反方審查', variant: 'secondary' },
  voting: { label: '投票中', variant: 'default' },
  approved: { label: '已通過', variant: 'default' },
  rejected: { label: '未通過', variant: 'destructive' },
  watchlist: { label: '觀察中', variant: 'outline' },
  closed: { label: '已結案', variant: 'secondary' },
}

type ProposalStatusBadgeProps = {
  status: ProposalStatus
}

export function ProposalStatusBadge({ status }: ProposalStatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
