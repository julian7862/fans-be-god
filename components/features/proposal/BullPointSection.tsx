'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { addBullPointAction, deleteBullPointAction } from '@/app/proposals/[proposalId]/actions'
import type { ProposalBullPoint } from '@/types/proposal'

const categories = [
  { value: 'fundamental', label: '基本面' },
  { value: 'industry_trend', label: '產業趨勢' },
  { value: 'valuation', label: '估值' },
  { value: 'technical', label: '技術面' },
  { value: 'chip', label: '籌碼面' },
  { value: 'news', label: '消息面' },
  { value: 'other', label: '其他' },
]

type BullPointSectionProps = {
  proposalId: string
  bullPoints: (ProposalBullPoint & { users: { display_name: string } })[]
  currentUserId: string
}

export function BullPointSection({ proposalId, bullPoints, currentUserId }: BullPointSectionProps) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [optimisticPoints, addOptimisticPoint] = useOptimistic(
    bullPoints,
    (current: typeof bullPoints, newPoint: { content: string; category: string }): typeof bullPoints => [
      ...current,
      { id: 'optimistic-' + Date.now(), proposal_id: proposalId, user_id: currentUserId, content: newPoint.content, category: (newPoint.category || null) as ProposalBullPoint['category'], created_at: new Date().toISOString(), users: { display_name: '我' } },
    ]
  )

  function handleAdd() {
    if (!content.trim()) return
    setError(null)
    const addContent = content.trim()
    const addCategory = category

    startTransition(async () => {
      addOptimisticPoint({ content: addContent, category: addCategory })
      setContent('')
      setCategory('')

      const formData = new FormData()
      formData.set('content', addContent)
      if (addCategory) formData.set('category', addCategory)

      const result = await addBullPointAction(proposalId, formData)
      if (result?.error) {
        setError(typeof result.error === 'string' ? result.error : '新增失敗')
      }
    })
  }

  async function handleDelete(id: string) {
    await deleteBullPointAction(id, proposalId)
  }

  return (
    <div className="space-y-4">
      {optimisticPoints.length === 0 ? (
        <p className="text-sm text-muted-foreground">尚無看多理由</p>
      ) : (
        <ul className="space-y-3">
          {optimisticPoints.map(bp => (
            <li key={bp.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm">{bp.content}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{bp.users.display_name}</span>
                    {bp.category && <Badge variant="outline" className="text-xs">{categories.find(c => c.value === bp.category)?.label ?? bp.category}</Badge>}
                  </div>
                </div>
                {bp.user_id === currentUserId && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(bp.id)}>
                    刪除
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 border-t pt-4">
        <Textarea
          placeholder="新增一個看多理由..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={2}
        />
        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={v => setCategory(v ?? '')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="分類" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAdd} disabled={isPending || !content.trim()}>
            {isPending ? '新增中...' : '新增'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
