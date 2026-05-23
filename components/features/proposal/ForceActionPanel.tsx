'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type ForceActionPanelProps = {
  proposalId: string
  onForceApprove: (proposalId: string) => Promise<{ error?: string; success?: boolean }>
  onForceReject: (proposalId: string) => Promise<{ error?: string; success?: boolean }>
}

export function ForceActionPanel({ proposalId, onForceApprove, onForceReject }: ForceActionPanelProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

  async function handleForceApprove() {
    setLoading('approve')
    setError(null)
    const result = await onForceApprove(proposalId)
    if (result?.error) {
      setError(result.error)
    } else {
      setDone('approved')
    }
    setLoading(null)
  }

  async function handleForceReject() {
    setLoading('reject')
    setError(null)
    const result = await onForceReject(proposalId)
    if (result?.error) {
      setError(result.error)
    } else {
      setDone('rejected')
    }
    setLoading(null)
  }

  if (done === 'approved') {
    return (
      <div className="rounded-md bg-green-50 px-3 py-2 dark:bg-green-950">
        <p className="text-sm font-medium text-green-700 dark:text-green-300">✓ 已強制核准進入共識</p>
      </div>
    )
  }

  if (done === 'rejected') {
    return (
      <div className="rounded-md bg-red-50 px-3 py-2 dark:bg-red-950">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">✗ 已強制標記為未通過</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">管理員操作，不受投票規則限制</p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          onClick={handleForceApprove}
          disabled={loading !== null}
        >
          {loading === 'approve' ? '處理中...' : '強制核准'}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleForceReject}
          disabled={loading !== null}
        >
          {loading === 'reject' ? '處理中...' : '強制未通過'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
