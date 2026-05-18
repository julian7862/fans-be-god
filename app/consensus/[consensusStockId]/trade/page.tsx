import { createClient } from '@/lib/supabase/server'
import { getConsensusStockById, getMyTradeRecord } from '@/lib/trade/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TradeForm } from '@/components/features/consensus/TradeForm'

export default async function TradePage({
  params,
}: {
  params: Promise<{ consensusStockId: string }>
}) {
  const { consensusStockId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const stockResult = await getConsensusStockById(consensusStockId)
  if (!stockResult.success) redirect('/groups')

  const stock = stockResult.data
  const tradeResult = await getMyTradeRecord(consensusStockId, user.id)
  const trade = tradeResult.success ? tradeResult.data : null

  if (!trade) redirect(`/consensus/${consensusStockId}`)

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <Link href={`/consensus/${consensusStockId}`}>
          <Button variant="outline" size="sm">返回標的詳情</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>交易紀錄 — {stock.ticker} {stock.stock_name}</CardTitle>
          <CardDescription>記錄你的買進 / 賣出資訊</CardDescription>
        </CardHeader>
        <CardContent>
          <TradeForm
            consensusStockId={consensusStockId}
            tradeId={trade.id}
            existingTrade={trade}
          />
        </CardContent>
      </Card>
    </div>
  )
}
