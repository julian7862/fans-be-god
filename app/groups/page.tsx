import { createClient } from '@/lib/supabase/server'
import { getGroupsForUser } from '@/lib/group/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GroupCard } from '@/components/features/group/GroupCard'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await getGroupsForUser(user.id, supabase)
  const groups = result.success ? result.data : []

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的投資小組</h1>
        <Link href="/groups/new">
          <Button>建立小組</Button>
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">你還沒有加入任何小組</p>
          <Link href="/groups/new" className="mt-4 inline-block">
            <Button variant="outline">建立你的第一個小組</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}
