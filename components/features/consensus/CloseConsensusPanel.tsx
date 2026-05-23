'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type CloseConsensusPanelProps = {
  consensusStockId: string
  onClose: (consensusStockId: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export function CloseConsensusPanel({ consensusStockId, onClose }: CloseConsensusPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closed, setClosed] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await onClose(consensusStockId, formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setClosed(true)
    }
    setLoading(false)
  }

  if (closed) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">✓ 已結案</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="exitPrice" className="text-sm">出場價格 *</Label>
        <Input
          id="exitPrice"
          name="exitPrice"
          type="number"
          step="0.01"
          placeholder="填寫出場均價"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="closeReason" className="text-sm">結案原因（選填）</Label>
        <Textarea
          id="closeReason"
          name="closeReason"
          rows={2}
          placeholder="達到目標價、停損觸發、觀察期結束..."
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm" className="w-full" disabled={loading}>
        {loading ? '結案中...' : '確認結案'}
      </Button>
    </form>
  )
}
