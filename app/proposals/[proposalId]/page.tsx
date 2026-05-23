import { createClient } from '@/lib/supabase/server'
import { getProposalById } from '@/lib/proposal/service'
import { getBullPoints, getRiskPoints, getComments, checkRiskSufficiency } from '@/lib/discussion/service'
import { getScores, getMyScore, getVotes, getMyVote } from '@/lib/scoring/service'
import { checkConsensusEligibility } from '@/lib/consensus/service'
import { getGroupMembers } from '@/lib/group/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProposalStatusBadge } from '@/components/features/proposal/ProposalStatusBadge'
import { BullPointSection } from '@/components/features/proposal/BullPointSection'
import { RiskPointSection } from '@/components/features/proposal/RiskPointSection'
import { CommentSection } from '@/components/features/proposal/CommentSection'
import { BearReviewerPanel } from '@/components/features/proposal/BearReviewerPanel'
import { ScorePanel } from '@/components/features/proposal/ScorePanel'
import { VotePanel } from '@/components/features/proposal/VotePanel'
import { ConsensusCheckPanel } from '@/components/features/proposal/ConsensusCheckPanel'
import { submitScoreAction, submitVoteAction, approveProposalAction, finalizeVoteAction } from './actions'

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ proposalId: string }>
}) {
  const { proposalId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await getProposalById(proposalId)
  if (!result.success) redirect('/groups')

  const proposal = result.data

  const [bullResult, riskResult, commentResult, sufficiencyResult, membersResult, scoresResult, myScoreResult, votesResult, myVoteResult, consensusResult] = await Promise.all([
    getBullPoints(proposalId),
    getRiskPoints(proposalId),
    getComments(proposalId),
    checkRiskSufficiency(proposalId),
    getGroupMembers(proposal.group_id),
    getScores(proposalId),
    getMyScore(proposalId, user.id),
    getVotes(proposalId),
    getMyVote(proposalId, user.id),
    checkConsensusEligibility(proposalId),
  ])

  const bullPoints = bullResult.success ? bullResult.data : []
  const riskPoints = riskResult.success ? riskResult.data : []
  const comments = commentResult.success ? commentResult.data : []
  const sufficiency = sufficiencyResult.success ? sufficiencyResult.data : { sufficient: false, bullCount: 0, riskCount: 0, minRiskRequired: 2 }
  const members = membersResult.success ? membersResult.data : []
  const allScores = scoresResult.success ? scoresResult.data : []
  const myScore = myScoreResult.success ? myScoreResult.data : null
  const allVotes = votesResult.success ? votesResult.data : []
  const myVote = myVoteResult.success ? myVoteResult.data : null
  const consensusCheck = consensusResult.success ? consensusResult.data : null

  const myMembership = members.find(m => m.user_id === user.id)

  // Only group members can access proposals
  if (!myMembership) redirect('/frontpage')

  const canApprove = myMembership.role === 'owner' || myMembership.role === 'admin'
  const canEdit = proposal.proposer_id === user.id || canApprove

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{proposal.ticker}</h1>
            <span className="text-lg text-muted-foreground">{proposal.stock_name}</span>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          {proposal.market && (
            <Badge variant="outline" className="mt-1">{proposal.market}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/proposals/${proposalId}/edit`}>
              <Button variant="outline" size="sm">編輯提案</Button>
            </Link>
          )}
          <Link href={`/groups/${proposal.group_id}/proposals`}>
            <Button variant="outline" size="sm">返回提案池</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Investment Thesis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">買進邏輯</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{proposal.investment_thesis}</p>
            </CardContent>
          </Card>

          {/* Bull Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                看多理由
                <Badge variant="secondary">{bullPoints.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BullPointSection
                proposalId={proposalId}
                bullPoints={bullPoints}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>

          {/* Risk Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                風險提醒
                <Badge variant={sufficiency.sufficient ? 'secondary' : 'destructive'}>
                  {riskPoints.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RiskPointSection
                proposalId={proposalId}
                riskPoints={riskPoints}
                currentUserId={user.id}
                minRiskRequired={sufficiency.minRiskRequired}
              />
            </CardContent>
          </Card>

          {/* Discussion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                討論
                <Badge variant="secondary">{comments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommentSection proposalId={proposalId} comments={comments} currentUserId={user.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">價格資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proposal.proposal_price && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">提案價格</span>
                  <span className="font-medium">{proposal.proposal_price}</span>
                </div>
              )}
              {proposal.target_price && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">目標價</span>
                  <span className="font-medium text-green-600">{proposal.target_price}</span>
                </div>
              )}
              {proposal.stop_loss_price && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">停損價</span>
                  <span className="font-medium text-red-600">{proposal.stop_loss_price}</span>
                </div>
              )}
              {proposal.expected_holding_days && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">預計持有天數</span>
                  <span className="font-medium">{proposal.expected_holding_days} 天</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exit Condition */}
          {proposal.exit_condition && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">退出條件</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{proposal.exit_condition}</p>
              </CardContent>
            </Card>
          )}

          {/* Bear Reviewer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">反方審查</CardTitle>
            </CardHeader>
            <CardContent>
              <BearReviewerPanel
                proposalId={proposalId}
                currentBearReviewerId={proposal.bear_reviewer_id}
                members={members}
                proposerId={proposal.proposer_id}
              />
            </CardContent>
          </Card>

          {/* Score Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">評分</CardTitle>
            </CardHeader>
            <CardContent>
              <ScorePanel
                proposalId={proposalId}
                myScore={myScore}
                allScores={allScores}
                onSubmitScore={submitScoreAction}
              />
            </CardContent>
          </Card>

          {/* Vote Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">投票</CardTitle>
            </CardHeader>
            <CardContent>
              <VotePanel
                proposalId={proposalId}
                myVote={myVote}
                allVotes={allVotes}
                canFinalize={canApprove && proposal.status === 'voting'}
                onSubmitVote={submitVoteAction}
                onFinalizeVote={finalizeVoteAction}
              />
            </CardContent>
          </Card>

          {/* Consensus Check */}
          {consensusCheck && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">共識門檻</CardTitle>
              </CardHeader>
              <CardContent>
                <ConsensusCheckPanel
                  proposalId={proposalId}
                  checkResult={consensusCheck}
                  canApprove={canApprove}
                  proposalStatus={proposal.status}
                  onApprove={approveProposalAction}
                />
              </CardContent>
            </Card>
          )}

          {/* Proposal Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">提案資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">提案日期</span>
                <span>{proposal.proposal_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">建立時間</span>
                <span>{new Date(proposal.created_at).toLocaleDateString('zh-TW')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
