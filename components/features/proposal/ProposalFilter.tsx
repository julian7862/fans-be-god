'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { ProposalStatus } from '@/types/proposal'

const filters: Array<{ value: string; label: string }> = [
  { value: '', label: '全部' },
  { value: 'submitted', label: '已提交' },
  { value: 'discussion', label: '討論中' },
  { value: 'voting', label: '投票中' },
  { value: 'approved', label: '已通過' },
  { value: 'rejected', label: '未通過' },
  { value: 'closed', label: '已結案' },
]

type ProposalFilterProps = {
  groupId: string
  currentFilter: string
}

export function ProposalFilter({ groupId, currentFilter }: ProposalFilterProps) {
  const router = useRouter()

  function handleFilter(value: string) {
    const params = new URLSearchParams()
    if (value) params.set('status', value)
    router.push(`/groups/${groupId}/proposals${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(f => (
        <Button
          key={f.value}
          variant={currentFilter === f.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter(f.value)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  )
}
