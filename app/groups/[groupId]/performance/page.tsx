import { createClient } from '@/lib/supabase/server'
import { getGroupPerformance } from '@/lib/performance/service'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PerformancePage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await getGroupPerformance(groupId)
  const perf = result.success ? result.data : null

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold">小組績效</h2>
        <p className="text-sm text-muted-foreground">所有數據以百分比報酬率為主</p>
      </div>

      {!perf || perf.totalConsensusStocks === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">尚無績效資料（需有已結案的交易紀錄）</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">共識標的數</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{perf.totalConsensusStocks}</p>
                <p className="text-xs text-muted-foreground">
                  持有中 {perf.activeStocks} / 已結案 {perf.closedStocks}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">小組平均報酬率</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${perf.groupAverageReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {perf.groupAverageReturnPct.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">中位數報酬率</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${perf.groupMedianReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {perf.groupMedianReturnPct.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">小組勝率</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{perf.groupWinRate.toFixed(0)}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">說明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• 平均報酬率 = 所有已結案交易的報酬率平均（不加權投入金額）</p>
              <p>• 中位數報酬率 = 所有已結案交易報酬率的中位數</p>
              <p>• 勝率 = 獲利交易數 / 已結案交易總數</p>
              <p>• 總跟進人次: {perf.totalFollowers}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
