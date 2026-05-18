import { createClient } from '@/lib/supabase/server'
import { getGroupById, getGroupMembers } from '@/lib/group/service'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemberList } from '@/components/features/group/MemberList'

export default async function GroupDashboardPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const groupResult = await getGroupById(groupId, user.id, supabase)
  if (!groupResult.success) redirect('/groups')

  const group = groupResult.data
  const membersResult = await getGroupMembers(groupId, supabase)
  const members = membersResult.success ? membersResult.data : []

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {group.description && (
        <p className="mb-6 text-muted-foreground">{group.description}</p>
      )}

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              成員數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{group.member_count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              提案中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              共識標的
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              小組平均報酬率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">N/A</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">待處理事項</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            目前沒有待處理事項
          </p>
        </CardContent>
      </Card>

      {/* Member List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">小組成員</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberList members={members} />
        </CardContent>
      </Card>
    </div>
  )
}
