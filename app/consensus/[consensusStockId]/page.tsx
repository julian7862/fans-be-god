import { createClient } from '@/lib/supabase/server'
import { getConsensusStockById, getTradeRecordsForConsensus, getMyTradeRecord } from '@/lib/trade/service'
import { calculateConsensusMetrics } from '@/lib/performance/calculateMetrics'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FollowButton } from '@/components/features/consensus/FollowButton'

export default async function ConsensusStockDetailPage({
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
  const tradesResult = await getTradeRecordsForConsensus(consensusStockId)
  const trades = tradesResult.success ? tradesResult.data : []
  const myTradeResult = await getMyTradeRecord(consensusStockId, user.id)
  const myTrade = myTradeResult.success ? myTradeResult.data : null

  const closedReturns = trades
    .filter(t => t.final_return_pct !== null)
    .map(t => t.final_return_pct as number)

  const metrics = calculateConsensusMetrics(closedReturns)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{stock.ticker}</h1>
            <span className="text-lg text-muted-foreground">{stock.stock_name}</span>
            <Badge variant={stock.status === 'active' ? 'default' : 'secondary'}>
              {stock.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            共識日期: {stock.consensus_date}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/consensus/${consensusStockId}/review`}>
            <Button variant="outline" size="sm">復盤</Button>
          </Link>
          <Link href={`/groups/${stock.group_id}/consensus`}>
            <Button variant="outline" size="sm">返回共識名單</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          {/* Metrics */}
          {closedReturns.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">平均報酬率</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-xl font-bold ${metrics.averageReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.averageReturnPct.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">中位數報酬率</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-xl font-bold ${metrics.medianReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.medianReturnPct.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">勝率</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">{metrics.winRate.toFixed(0)}%</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Member Trade Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">成員跟進紀錄</CardTitle>
            </CardHeader>
            <CardContent>
              {trades.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚無成員跟進</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>成員</TableHead>
                      <TableHead>買進價</TableHead>
                      <TableHead>賣出價</TableHead>
                      <TableHead>報酬率</TableHead>
                      <TableHead>狀態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.map(trade => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">{trade.users.display_name}</TableCell>
                        <TableCell>{trade.buy_price ?? '-'}</TableCell>
                        <TableCell>{trade.sell_price ?? '-'}</TableCell>
                        <TableCell>
                          {trade.final_return_pct !== null ? (
                            <span className={trade.final_return_pct >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {trade.final_return_pct.toFixed(1)}%
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {trade.status === 'holding' ? '持有中' : trade.status === 'closed' ? '已賣出' : trade.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">共識資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {stock.consensus_price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">共識價格</span>
                  <span className="font-medium">{stock.consensus_price}</span>
                </div>
              )}
              {stock.consensus_target_price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">目標價</span>
                  <span className="font-medium text-green-600">{stock.consensus_target_price}</span>
                </div>
              )}
              {stock.consensus_stop_loss_price && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">停損價</span>
                  <span className="font-medium text-red-600">{stock.consensus_stop_loss_price}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">跟進人數</span>
                <span className="font-medium">{trades.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* My Trade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">我的跟進</CardTitle>
            </CardHeader>
            <CardContent>
              {myTrade ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">狀態</span>
                    <Badge variant="outline">{myTrade.status === 'holding' ? '持有中' : '已賣出'}</Badge>
                  </div>
                  {myTrade.buy_price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">買進價</span>
                      <span>{myTrade.buy_price}</span>
                    </div>
                  )}
                  {myTrade.sell_price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">賣出價</span>
                      <span>{myTrade.sell_price}</span>
                    </div>
                  )}
                  {myTrade.final_return_pct !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">報酬率</span>
                      <span className={myTrade.final_return_pct >= 0 ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
                        {myTrade.final_return_pct.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <Link href={`/consensus/${consensusStockId}/trade`}>
                    <Button size="sm" variant="outline" className="mt-2 w-full">
                      {myTrade.buy_price ? '更新紀錄' : '填寫買進資訊'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <FollowButton consensusStockId={consensusStockId} groupId={stock.group_id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
