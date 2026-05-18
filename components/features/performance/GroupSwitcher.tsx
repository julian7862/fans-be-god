'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Group {
  id: string
  name: string
}

interface GroupSwitcherProps {
  groups: Group[]
  currentGroupId: string
}

export function GroupSwitcher({ groups, currentGroupId }: GroupSwitcherProps) {
  const router = useRouter()

  const handleGroupChange = (newGroupId: string | null) => {
    if (newGroupId) {
      router.push(`/groups/${newGroupId}/performance`)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">小組選擇:</label>
      <Select value={currentGroupId} onValueChange={handleGroupChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
