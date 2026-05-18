'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProposalSchema, type CreateProposalInput } from '@/lib/validation/proposalSchema'
import { createProposalAction } from '@/app/groups/[groupId]/proposals/actions'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type ProposalFormProps = {
  groupId: string
}

export function ProposalForm({ groupId }: ProposalFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateProposalInput>({
    resolver: zodResolver(createProposalSchema),
  })

  async function onSubmit(data: CreateProposalInput) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('ticker', data.ticker)
    formData.set('stockName', data.stockName)
    if (data.market) formData.set('market', data.market)
    if (data.proposalPrice) formData.set('proposalPrice', String(data.proposalPrice))
    formData.set('investmentThesis', data.investmentThesis)
    formData.set('targetPrice', String(data.targetPrice))
    if (data.stopLossPrice) formData.set('stopLossPrice', String(data.stopLossPrice))
    if (data.exitCondition) formData.set('exitCondition', data.exitCondition)
    if (data.expectedHoldingDays) formData.set('expectedHoldingDays', String(data.expectedHoldingDays))

    const result = await createProposalAction(groupId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : '請檢查輸入內容')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ticker">股票代號 *</Label>
          <Input id="ticker" placeholder="例如：2330" {...register('ticker')} />
          {errors.ticker && <p className="text-sm text-destructive">{errors.ticker.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stockName">股票名稱 *</Label>
          <Input id="stockName" placeholder="例如：台積電" {...register('stockName')} />
          {errors.stockName && <p className="text-sm text-destructive">{errors.stockName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="market">市場</Label>
          <Input id="market" placeholder="例如：台股、美股" {...register('market')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proposalPrice">提案時價格</Label>
          <Input id="proposalPrice" type="number" step="0.01" {...register('proposalPrice', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="investmentThesis">買進邏輯 * (至少 20 字)</Label>
        <Textarea
          id="investmentThesis"
          placeholder="為什麼看好這檔股票？核心投資邏輯是什麼？"
          rows={5}
          {...register('investmentThesis')}
        />
        {errors.investmentThesis && <p className="text-sm text-destructive">{errors.investmentThesis.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="targetPrice">目標價 *</Label>
          <Input id="targetPrice" type="number" step="0.01" {...register('targetPrice', { valueAsNumber: true })} />
          {errors.targetPrice && <p className="text-sm text-destructive">{errors.targetPrice.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stopLossPrice">停損價</Label>
          <Input id="stopLossPrice" type="number" step="0.01" {...register('stopLossPrice', { valueAsNumber: true })} />
          {errors.stopLossPrice && <p className="text-sm text-destructive">{errors.stopLossPrice.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedHoldingDays">預計持有天數</Label>
          <Input id="expectedHoldingDays" type="number" {...register('expectedHoldingDays', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="exitCondition">退出條件（如未填停損價則必填）</Label>
        <Textarea
          id="exitCondition"
          placeholder="什麼情況下應該離場？"
          rows={2}
          {...register('exitCondition')}
        />
        {errors.exitCondition && <p className="text-sm text-destructive">{errors.exitCondition.message}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '提交中...' : '提交提案'}
      </Button>
    </form>
  )
}
