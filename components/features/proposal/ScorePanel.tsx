'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { ProposalScore } from '@/types/proposal'

const dimensions = [
  { key: 'fundamental_score', label: '基本面' },
  { key: 'industry_score', label: '產業趨勢' },
  { key: 'valuation_score', label: '估值合理性' },
  { key: 'risk_control_score', label: '風險控制' },
  { key: 'plan_score', label: '計畫完整度' },
] as const

type ScorePanelProps = {
  proposalId: string
  myScore: ProposalScore | null
  allScores: (ProposalScore & { users: { display_name: string } })[]
  onSubmitScore: (proposalId: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export function ScorePanel({ proposalId, myScore, allScores, onSubmitScore }: ScorePanelProps) {
  const [scores, setScores] = useState<Record<string, number>>({
    fundamental_score: myScore?.fundamental_score ?? 10,
    industry_score: myScore?.industry_score ?? 10,
    valuation_score: myScore?.valuation_score ?? 10,
    risk_control_score: myScore?.risk_control_score ?? 10,
    plan_score: myScore?.plan_score ?? 10,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0)
  const avgScore = allScores.length > 0
    ? (allScores.reduce((sum, s) => sum + s.total_score, 0) / allScores.length).toFixed(1)
    : null

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    for (const [key, val] of Object.entries(scores)) {
      formData.set(key, String(val))
    }

    const result = await onSubmitScore(proposalId, formData)
    if (result?.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">已評分: {allScores.length} 人</span>
        {avgScore && <Badge variant="secondary">平均 {avgScore}/100</Badge>}
      </div>

      {/* My Score Form */}
      <div className="space-y-3">
        {dimensions.map(dim => (
          <div key={dim.key} className="flex items-center gap-3">
            <Label className="w-24 text-xs">{dim.label}</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={scores[dim.key]}
              onChange={e => setScores(prev => ({ ...prev, [dim.key]: Number(e.target.value) || 1 }))}
              className="w-16 text-center"
            />
            <span className="text-xs text-muted-foreground">/20</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-sm font-medium">總分: {totalScore}/100</span>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? '送出中...' : myScore ? '更新評分' : '提交評分'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Other scores */}
      {allScores.length > 0 && (
        <div className="border-t pt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">成員評分</p>
          <div className="space-y-1">
            {allScores.map(s => (
              <div key={s.id} className="flex justify-between text-xs">
                <span>{s.users.display_name}</span>
                <span className="font-medium">{s.total_score}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
