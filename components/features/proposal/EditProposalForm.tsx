'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProposalSchema, type UpdateProposalFormInput } from '@/lib/validation/proposalSchema'
import { updateProposalAction } from '@/app/proposals/[proposalId]/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { StockProposal } from '@/types/proposal'

type EditProposalFormProps = {
  proposalId: string
  proposal: StockProposal
}

export function EditProposalForm({ proposalId, proposal }: EditProposalFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProposalFormInput>({
    resolver: zodResolver(updateProposalSchema),
    defaultValues: {
      ticker: proposal.ticker,
      stockName: proposal.stock_name,
      market: proposal.market ?? '',
      proposalPrice: proposal.proposal_price ?? undefined,
      investmentThesis: proposal.investment_thesis,
      targetPrice: proposal.target_price ?? undefined,
      stopLossPrice: proposal.stop_loss_price ?? undefined,
      exitCondition: proposal.exit_condition ?? '',
      expectedHoldingDays: proposal.expected_holding_days ?? undefined,
    },
  })

  async function onSubmit(data: UpdateProposalFormInput) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    if (data.ticker) formData.set('ticker', data.ticker)
    if (data.stockName) formData.set('stockName', data.stockName)
    if (data.market) formData.set('market', data.market)
    if (data.proposalPrice) formData.set('proposalPrice', String(data.proposalPrice))
    if (data.investmentThesis) formData.set('investmentThesis', data.investmentThesis)
    if (data.targetPrice) formData.set('targetPrice', String(data.targetPrice))
    if (data.stopLossPrice) formData.set('stopLossPrice', String(data.stopLossPrice))
    if (data.exitCondition) formData.set('exitCondition', data.exitCondition)
    if (data.expectedHoldingDays) formData.set('expectedHoldingDays', String(data.expectedHoldingDays))

    const result = await updateProposalAction(proposalId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : '儲存失敗')
      setLoading(false)
      return
    }

    router.push(`/proposals/${proposalId}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ticker">股票代號</Label>
          <Input id="ticker" placeholder="例如：2330" {...register('ticker')} />
          {errors.ticker && <p className="text-sm text-destructive">{errors.ticker.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stockName">股票名稱</Label>
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
        <Label htmlFor="investmentThesis">買進邏輯（至少 20 字）</Label>
        <Textarea
          id="investmentThesis"
          rows={5}
          {...register('investmentThesis')}
        />
        {errors.investmentThesis && <p className="text-sm text-destructive">{errors.investmentThesis.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="targetPrice">目標價</Label>
          <Input id="targetPrice" type="number" step="0.01" {...register('targetPrice', { valueAsNumber: true })} />
          {errors.targetPrice && <p className="text-sm text-destructive">{errors.targetPrice.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stopLossPrice">停損價</Label>
          <Input id="stopLossPrice" type="number" step="0.01" {...register('stopLossPrice', { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedHoldingDays">預計持有天數</Label>
          <Input id="expectedHoldingDays" type="number" {...register('expectedHoldingDays', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="exitCondition">退出條件</Label>
        <Textarea
          id="exitCondition"
          rows={2}
          {...register('exitCondition')}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? '儲存中...' : '儲存變更'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/proposals/${proposalId}`)}
          disabled={loading}
        >
          取消
        </Button>
      </div>
    </form>
  )
}
