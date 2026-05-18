import { createClient } from '@/lib/supabase/server'
import { getMemberRankings, getConsensusStockRankings } from '@/lib/performance/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function RankingsPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [memberResult, stockResult] = await Promise.all([
    getMemberRankings(groupId),
    getConsensusStockRankings(groupId),
  ])

  const memberRankings = memberResult.success ? memberResult.data : []
  const stockRankings = stockResult.success ? stockResult.data : []

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold">排行榜</h2>
        <p className="text-sm text-muted-foreground">以百分比報酬率排名，不比投入金額</p>
      </div>

      <div className="space-y-8">
        {/* Member Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">成員平均報酬率排行</CardTitle>
            <p className="text-xs text-muted-foreground">需參與 ≥ 3 檔共識標的才列入排名</p>
          </CardHeader>
          <CardContent>
            {memberRankings.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無足夠資料</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>成員</TableHead>
                    <TableHead>平均報酬率</TableHead>
                    <TableHead>勝率</TableHead>
                    <TableHead>交易數</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberRankings.map((m, i) => (
                    <TableRow key={m.userId}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell>{m.displayName}</TableCell>
                      <TableCell>
                        <span className={m.averageReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {m.averageReturnPct.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>{m.winRate.toFixed(0)}%</TableCell>
                      <TableCell>{m.tradeCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Consensus Stock Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">共識標的報酬率排行</CardTitle>
            <p className="text-xs text-muted-foreground">需 ≥ 2 人跟進才列入排名</p>
          </CardHeader>
          <CardContent>
            {stockRankings.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無足夠資料</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>標的</TableHead>
                    <TableHead>平均報酬率</TableHead>
                    <TableHead>跟進人數</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockRankings.map((s, i) => (
                    <TableRow key={s.consensusStockId}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell>
                        <Link href={`/consensus/${s.consensusStockId}`} className="hover:underline">
                          {s.ticker} <span className="text-muted-foreground">{s.stockName}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={s.averageReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {s.averageReturnPct.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>{s.followerCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
