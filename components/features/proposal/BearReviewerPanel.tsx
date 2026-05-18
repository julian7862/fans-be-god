'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { assignBearReviewerAction } from '@/app/proposals/[proposalId]/actions'
import type { GroupMemberWithUser } from '@/types/group'

type BearReviewerPanelProps = {
  proposalId: string
  currentBearReviewerId: string | null
  members: GroupMemberWithUser[]
  proposerId: string
}

export function BearReviewerPanel({
  proposalId,
  currentBearReviewerId,
  members,
  proposerId,
}: BearReviewerPanelProps) {
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentBear = members.find(m => m.user_id === currentBearReviewerId)
  const eligibleMembers = members.filter(m => m.user_id !== proposerId)

  async function handleAssign() {
    if (!selectedId) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('bearReviewerId', selectedId)

    const result = await assignBearReviewerAction(proposalId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : '指定失敗')
    } else {
      setSelectedId('')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      {currentBearReviewerId ? (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">反方</Badge>
          <span className="text-sm font-medium">
            {currentBear?.users.display_name ?? '已指定'}
          </span>
        </div>
      ) : (
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          尚未指定反方審查者
        </p>
      )}

      <div className="flex items-center gap-2">
        <Select value={selectedId} onValueChange={v => setSelectedId(v ?? '')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="選擇成員" />
          </SelectTrigger>
          <SelectContent>
            {eligibleMembers.map(m => (
              <SelectItem key={m.user_id} value={m.user_id}>
                {m.users.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleAssign} disabled={loading || !selectedId}>
          {loading ? '指定中...' : currentBearReviewerId ? '重新指定' : '指定反方'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
