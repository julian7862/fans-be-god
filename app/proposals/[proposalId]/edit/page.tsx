import { createClient } from '@/lib/supabase/server'
import { getProposalById } from '@/lib/proposal/service'
import { getGroupMembers } from '@/lib/group/service'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EditProposalForm } from '@/components/features/proposal/EditProposalForm'

export default async function EditProposalPage({
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

  if (!['draft', 'submitted'].includes(proposal.status)) {
    redirect(`/proposals/${proposalId}`)
  }

  const membersResult = await getGroupMembers(proposal.group_id)
  const members = membersResult.success ? membersResult.data : []
  const myMembership = members.find(m => m.user_id === user.id)

  if (!myMembership) redirect('/frontpage')

  const canEdit =
    proposal.proposer_id === user.id ||
    myMembership.role === 'owner' ||
    myMembership.role === 'admin'

  if (!canEdit) redirect(`/proposals/${proposalId}`)

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>編輯提案 — {proposal.ticker} {proposal.stock_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProposalForm proposalId={proposalId} proposal={proposal} />
        </CardContent>
      </Card>
    </div>
  )
}
