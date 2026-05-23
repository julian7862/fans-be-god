import { createClient } from '@/lib/supabase/server'
import { getProposalsForGroup } from '@/lib/proposal/service'
import { getGroupMembers } from '@/lib/group/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProposalCard } from '@/components/features/proposal/ProposalCard'
import { ProposalFilter } from '@/components/features/proposal/ProposalFilter'
import type { ProposalStatus } from '@/types/proposal'

export default async function ProposalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { groupId } = await params
  const { status } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if user is a member of this group
  const membersResult = await getGroupMembers(groupId)
  const members = membersResult.success ? membersResult.data : []
  const isMember = members.some(m => m.user_id === user.id)

  if (!isMember) redirect('/frontpage')

  const statusFilter = status as ProposalStatus | undefined
  const result = await getProposalsForGroup(groupId, statusFilter)
  const proposals = result.success ? result.data : []

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">提案池</h2>
        {status !== 'rejected' && status !== 'closed' && (
          <Link href={`/groups/${groupId}/proposals/new`}>
            <Button>新增提案</Button>
          </Link>
        )}
      </div>

      <div className="mb-6">
        <ProposalFilter groupId={groupId} currentFilter={status ?? ''} />
      </div>

      {proposals.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {status ? '此狀態下沒有提案' : '還沒有任何提案'}
          </p>
          <Link href={`/groups/${groupId}/proposals/new`} className="mt-4 inline-block">
            <Button variant="outline">提出第一個標的</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  )
}
