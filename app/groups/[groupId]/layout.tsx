import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GroupNav } from '@/components/features/group/GroupNav'

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: group } = await supabase
    .from('groups')
    .select('name')
    .eq('id', groupId)
    .single()

  return (
    <div>
      <div className="border-b bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 pt-4 pb-0 text-center">
          <h1 className="mb-3 text-lg font-bold">{group?.name ?? '小組'}</h1>
        </div>
        <GroupNav groupId={groupId} />
      </div>
      {children}
    </div>
  )
}
