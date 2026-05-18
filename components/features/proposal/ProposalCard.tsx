import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProposalStatusBadge } from './ProposalStatusBadge'
import type { StockProposal } from '@/types/proposal'

type ProposalCardProps = {
  proposal: StockProposal
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <Link href={`/proposals/${proposal.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>
              {proposal.ticker}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {proposal.stock_name}
              </span>
            </span>
            <ProposalStatusBadge status={proposal.status} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {proposal.investment_thesis}
          </p>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            {proposal.target_price && (
              <span>目標價: {proposal.target_price}</span>
            )}
            {proposal.stop_loss_price && (
              <span>停損價: {proposal.stop_loss_price}</span>
            )}
            <span>{proposal.proposal_date}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
