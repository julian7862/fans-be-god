'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ConsensusCheckResult } from '@/types/performance'

type ConsensusCheckPanelProps = {
  proposalId: string
  checkResult: ConsensusCheckResult
  canApprove: boolean
  proposalStatus: string
  onApprove: (proposalId: string) => Promise<{ error?: string; success?: boolean }>
}

export function ConsensusCheckPanel({ proposalId, checkResult, canApprove, proposalStatus, onApprove }: ConsensusCheckPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [approved, setApproved] = useState(false)

  async function handleApprove() {
    setLoading(true)
    setError(null)

    const result = await onApprove(proposalId)
    if (result?.error) {
      setError(result.error)
    } else {
      setApproved(true)
    }
    setLoading(false)
  }

  const isApproved = proposalStatus === 'approved' || approved

  return (
    <div className="space-y-3">
      {/* Pass/Fail indicator */}
      <div className="flex items-center gap-2">
        <Badge variant={checkResult.passed ? 'default' : 'destructive'}>
          {checkResult.passed ? '已達共識門檻' : '未達共識門檻'}
        </Badge>
      </div>

      {/* Stats */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">同意比例</span>
          <span>{(checkResult.agreeRatio * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">平均評分</span>
          <span>{checkResult.averageScore.toFixed(1)}/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">看多理由</span>
          <span>{checkResult.bullPointCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">風險提醒</span>
          <span>{checkResult.riskPointCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">反方審查</span>
          <span>{checkResult.hasBearReviewer ? '已指定' : '未指定'}</span>
        </div>
      </div>

      {/* Missing items */}
      {checkResult.missingItems.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-destructive">缺少項目：</p>
          <ul className="space-y-0.5">
            {checkResult.missingItems.map((item, i) => (
              <li key={i} className="text-xs text-destructive">• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {checkResult.warnings.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-yellow-600">提醒：</p>
          <ul className="space-y-0.5">
            {checkResult.warnings.map((w, i) => (
              <li key={i} className="text-xs text-yellow-600">• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Approve button / approved state */}
      {isApproved ? (
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 dark:bg-green-950">
          <span className="text-sm font-medium text-green-700 dark:text-green-300">✓ 已核准進入共識名單</span>
        </div>
      ) : checkResult.passed && canApprove ? (
        <Button size="sm" className="w-full" onClick={handleApprove} disabled={loading}>
          {loading ? '核准中...' : '核准進入共識名單'}
        </Button>
      ) : null}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
