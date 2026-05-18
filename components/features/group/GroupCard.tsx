import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GroupWithMemberCount } from '@/types/group'

type GroupCardProps = {
  group: GroupWithMemberCount
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            {group.name}
            <Badge variant="secondary">{group.member_count} 人</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {group.description || '尚無描述'}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
