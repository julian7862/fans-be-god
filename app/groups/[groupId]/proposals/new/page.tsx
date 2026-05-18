import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProposalForm } from '@/components/features/proposal/ProposalForm'

export default async function NewProposalPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>新增股票提案</CardTitle>
          <CardDescription>
            提出一檔你認為值得研究的標的，小組成員將補充優點、風險並進行投票
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProposalForm groupId={groupId} />
        </CardContent>
      </Card>
    </div>
  )
}
