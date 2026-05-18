import { Badge } from '@/components/ui/badge'
import type { GroupMemberWithUser } from '@/types/group'

type MemberListProps = {
  members: GroupMemberWithUser[]
}

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: '成員',
  viewer: '觀察者',
}

export function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">尚無成員</p>
  }

  return (
    <div className="space-y-3">
      {members.map(member => (
        <div
          key={member.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <p className="font-medium">{member.users.display_name}</p>
            <p className="text-sm text-muted-foreground">{member.users.email}</p>
          </div>
          <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
            {roleLabels[member.role] ?? member.role}
          </Badge>
        </div>
      ))}
    </div>
  )
}
