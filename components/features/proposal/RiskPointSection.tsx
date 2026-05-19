'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { addRiskPointAction, deleteRiskPointAction, updateRiskPointAction } from '@/app/proposals/[proposalId]/actions'
import type { ProposalRiskPoint, RiskSeverity } from '@/types/proposal'

const severityConfig: Record<RiskSeverity, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: '低', variant: 'outline' },
  medium: { label: '中', variant: 'secondary' },
  high: { label: '高', variant: 'default' },
  critical: { label: '嚴重', variant: 'destructive' },
}

type RiskPointSectionProps = {
  proposalId: string
  riskPoints: (ProposalRiskPoint & { users: { display_name: string } })[]
  currentUserId: string
  minRiskRequired: number
}

export function RiskPointSection({ proposalId, riskPoints, currentUserId, minRiskRequired }: RiskPointSectionProps) {
  const [content, setContent] = useState('')
  const [severity, setSeverity] = useState<RiskSeverity>('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insufficient = riskPoints.length < minRiskRequired

  async function handleAdd() {
    if (!content.trim()) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('content', content)
    formData.set('severity', severity)

    const result = await addRiskPointAction(proposalId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : '新增失敗')
    } else {
      setContent('')
      setSeverity('medium')
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await deleteRiskPointAction(id, proposalId)
  }

  return (
    <div className="space-y-4">
      {insufficient && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-950">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            風險提醒不足：目前 {riskPoints.length} 筆，至少需要 {minRiskRequired} 筆才可進入投票
          </p>
        </div>
      )}

      {riskPoints.length === 0 ? (
        <p className="text-sm text-muted-foreground">尚無風險提醒</p>
      ) : (
        <ul className="space-y-3">
          {riskPoints.map(rp => (
            <li key={rp.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm">{rp.content}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{rp.users.display_name}</span>
                    <Badge variant={severityConfig[rp.severity].variant} className="text-xs">
                      {severityConfig[rp.severity].label}
                    </Badge>
                    {rp.happened && <Badge variant="destructive" className="text-xs">已發生</Badge>}
                  </div>
                </div>
                {rp.user_id === currentUserId && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => console.log('Edit:', rp.id)}>
                      編輯
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(rp.id)}>
                      刪除
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 border-t pt-4">
        <Textarea
          placeholder="新增一個風險提醒..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={2}
        />
        <div className="flex items-center gap-2">
          <Select value={severity} onValueChange={v => setSeverity((v ?? 'medium') as RiskSeverity)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="嚴重度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="critical">嚴重</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAdd} disabled={loading || !content.trim()}>
            {loading ? '新增中...' : '新增'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
