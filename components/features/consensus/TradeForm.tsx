'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { recordBuyAction, recordSellAction } from '@/app/consensus/[consensusStockId]/actions'
import type { TradeRecord } from '@/types/trade'

type TradeFormProps = {
  consensusStockId: string
  tradeId: string
  existingTrade: TradeRecord
}

export function TradeForm({ consensusStockId, tradeId, existingTrade }: TradeFormProps) {
  const [buyDate, setBuyDate] = useState(existingTrade.buy_date ?? '')
  const [buyPrice, setBuyPrice] = useState(existingTrade.buy_price?.toString() ?? '')
  const [quantity, setQuantity] = useState(existingTrade.quantity?.toString() ?? '')
  const [investedAmount, setInvestedAmount] = useState(existingTrade.invested_amount?.toString() ?? '')
  const [sellDate, setSellDate] = useState(existingTrade.sell_date ?? '')
  const [sellPrice, setSellPrice] = useState(existingTrade.sell_price?.toString() ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function handleBuy() {
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.set('buyDate', buyDate)
    formData.set('buyPrice', buyPrice)
    formData.set('quantity', quantity)
    formData.set('investedAmount', investedAmount)

    const result = await recordBuyAction(consensusStockId, tradeId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : '操作失敗')
    } else {
      setSuccessMsg('買進紀錄已儲存')
    }
    setLoading(false)
  }

  async function handleSell() {
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.set('sellDate', sellDate)
    formData.set('sellPrice', sellPrice)

    const result = await recordSellAction(consensusStockId, tradeId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : '操作失敗')
    } else {
      setSuccessMsg('賣出紀錄已儲存，報酬率已計算')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Buy Section */}
      <div className="space-y-4">
        <h3 className="font-medium">買進資訊</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="buyDate">買進日期</Label>
            <Input id="buyDate" type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyPrice">買進價格</Label>
            <Input id="buyPrice" type="number" step="0.01" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">買進數量</Label>
            <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investedAmount">投入金額</Label>
            <Input id="investedAmount" type="number" step="0.01" value={investedAmount} onChange={e => setInvestedAmount(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleBuy} disabled={loading} className="w-full">
          {loading ? '儲存中...' : existingTrade.buy_price ? '更新買進紀錄' : '記錄買進'}
        </Button>
      </div>

      {/* Sell Section - only show if buy is recorded */}
      {existingTrade.buy_price && existingTrade.status !== 'closed' && (
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-medium">賣出資訊</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sellDate">賣出日期</Label>
              <Input id="sellDate" type="date" value={sellDate} onChange={e => setSellDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellPrice">賣出價格</Label>
              <Input id="sellPrice" type="number" step="0.01" value={sellPrice} onChange={e => setSellPrice(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSell} disabled={loading} variant="destructive" className="w-full">
            {loading ? '儲存中...' : '記錄賣出'}
          </Button>
        </div>
      )}

      {/* Result display */}
      {existingTrade.status === 'closed' && existingTrade.final_return_pct !== null && (
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">已實現報酬率</p>
          <p className={`text-2xl font-bold ${existingTrade.final_return_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {existingTrade.final_return_pct.toFixed(2)}%
          </p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}
    </div>
  )
}
