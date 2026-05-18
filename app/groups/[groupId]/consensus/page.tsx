import { createClient } from '@/lib/supabase/server'
import { getConsensusStocksForGroup } from '@/lib/trade/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ConsensusStockStatus } from '@/types/trade'

const statusLabels: Record<ConsensusStockStatus, string> = {
  active: '持有中',
  watching: '觀察中',
  closed: '已結案',
  cancelled: '已取消',
}

export default async function ConsensusListPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await getConsensusStocksForGroup(groupId)
  const stocks = result.success ? result.data : []

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold">共識名單</h2>
        <p className="text-sm text-muted-foreground">通過共識門檻的標的</p>
      </div>

      {stocks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">尚無通過共識的標的</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stocks.map(stock => (
            <Link key={stock.id} href={`/consensus/${stock.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>
                      {stock.ticker}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {stock.stock_name}
                      </span>
                    </span>
                    <Badge variant={stock.status === 'active' ? 'default' : 'secondary'}>
                      {statusLabels[stock.status]}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>共識日期</span>
                      <span>{stock.consensus_date}</span>
                    </div>
                    {stock.consensus_price && (
                      <div className="flex justify-between">
                        <span>共識價格</span>
                        <span>{stock.consensus_price}</span>
                      </div>
                    )}
                    {stock.consensus_target_price && (
                      <div className="flex justify-between">
                        <span>目標價</span>
                        <span className="text-green-600">{stock.consensus_target_price}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
