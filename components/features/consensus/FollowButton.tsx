'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { followConsensusStockAction } from '@/app/consensus/[consensusStockId]/actions'

type FollowButtonProps = {
  consensusStockId: string
  groupId: string
}

export function FollowButton({ consensusStockId, groupId }: FollowButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFollow() {
    setLoading(true)
    setError(null)

    const result = await followConsensusStockAction(consensusStockId, groupId)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : '操作失敗')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">你尚未跟進此標的</p>
      <Button size="sm" className="w-full" onClick={handleFollow} disabled={loading}>
        {loading ? '跟進中...' : '我要跟進'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
