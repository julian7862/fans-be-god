import { createClient } from '@/lib/supabase/server'
import { getGroupPerformance, getMemberRankings } from '@/lib/performance/service'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PerformanceChart } from '@/components/features/performance/PerformanceChart'
import { GroupSwitcher } from '@/components/features/performance/GroupSwitcher'

// 假資料用於測試（實際應替換為計算歷史績效）
// 小組 1: 科技股研究小組
const MOCK_PERFORMANCE_DATA_GROUP1 = [
  { date: '2024-01-01', returnPct: 1.2 },
  { date: '2024-01-15', returnPct: 3.5 },
  { date: '2024-02-01', returnPct: 5.8 },
  { date: '2024-02-15', returnPct: 4.2 },
  { date: '2024-03-01', returnPct: 7.3 },
  { date: '2024-03-15', returnPct: 9.1 },
  { date: '2024-04-01', returnPct: 8.5 },
  { date: '2024-04-15', returnPct: 10.2 },
  { date: '2024-05-01', returnPct: 12.5 },
  { date: '2024-05-15', returnPct: 11.8 },
  { date: '2024-06-01', returnPct: 13.4 },
]

const MOCK_MEMBER_RANKINGS_GROUP1 = [
  { userId: '1', displayName: '陳小明', averageReturnPct: 15.5, winRate: 75, tradeCount: 4 },
  { userId: '2', displayName: '李曉芬', averageReturnPct: 12.3, winRate: 66, tradeCount: 3 },
  { userId: '3', displayName: '王大衛', averageReturnPct: 8.7, winRate: 50, tradeCount: 4 },
  { userId: '4', displayName: '林美玲', averageReturnPct: 5.2, winRate: 40, tradeCount: 5 },
]

// 小組 2: 消費股研究小組
const MOCK_PERFORMANCE_DATA_GROUP2 = [
  { date: '2024-01-01', returnPct: 2.1 },
  { date: '2024-01-15', returnPct: 1.8 },
  { date: '2024-02-01', returnPct: 3.2 },
  { date: '2024-02-15', returnPct: 5.5 },
  { date: '2024-03-01', returnPct: 4.9 },
  { date: '2024-03-15', returnPct: 6.3 },
  { date: '2024-04-01', returnPct: 7.1 },
  { date: '2024-04-15', returnPct: 5.8 },
  { date: '2024-05-01', returnPct: 8.4 },
  { date: '2024-05-15', returnPct: 9.2 },
  { date: '2024-06-01', returnPct: 8.5 },
]

const MOCK_MEMBER_RANKINGS_GROUP2 = [
  { userId: '5', displayName: '張偉傑', averageReturnPct: 18.2, winRate: 80, tradeCount: 5 },
  { userId: '6', displayName: '黃琪琪', averageReturnPct: 10.5, winRate: 62, tradeCount: 4 },
  { userId: '7', displayName: '劉思宇', averageReturnPct: 7.3, winRate: 55, tradeCount: 5 },
  { userId: '8', displayName: '陳家欣', averageReturnPct: 4.1, winRate: 45, tradeCount: 4 },
]

// 根據 groupId 選擇假資料
const getMockDataByGroupId = (groupId: string) => {
  // 簡單的 hash 函數，偶數 ID 用 Group1，奇數 ID 用 Group2
  const isEven = parseInt(groupId.charAt(0)) % 2 === 0

  if (isEven) {
    return {
      performanceData: MOCK_PERFORMANCE_DATA_GROUP1,
      memberRankings: MOCK_MEMBER_RANKINGS_GROUP1,
      currentReturnPct: 13.4,
      totalConsensusStocks: 8,
      activeStocks: 3,
      closedStocks: 5,
      groupAverageReturnPct: 13.4,
      groupMedianReturnPct: 12.5,
      groupWinRate: 67.5,
      totalFollowers: 12,
    }
  } else {
    return {
      performanceData: MOCK_PERFORMANCE_DATA_GROUP2,
      memberRankings: MOCK_MEMBER_RANKINGS_GROUP2,
      currentReturnPct: 8.5,
      totalConsensusStocks: 7,
      activeStocks: 2,
      closedStocks: 5,
      groupAverageReturnPct: 8.5,
      groupMedianReturnPct: 8.4,
      groupWinRate: 65.0,
      totalFollowers: 10,
    }
  }
}

export default async function PerformancePage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 假資料：用戶所屬的小組列表（實際應從數據庫查詢）
  const MOCK_USER_GROUPS = [
    { id: '1', name: '科技股研究小組' },
    { id: '2', name: '消費股研究小組' },
  ]

  // 獲取用戶所屬的所有小組
  // const { data: userGroups } = await supabase
  //   .from('group_members')
  //   .select('groups(id, name)')
  //   .eq('user_id', user.id)

  // const groups = userGroups?.map(m => (m.groups as unknown as { id: string; name: string })).filter(Boolean) ?? []

  // 使用假資料進行測試
  const groups = MOCK_USER_GROUPS

  const result = await getGroupPerformance(groupId)
  const perf = result.success ? result.data : null

  // 獲取當前小組名稱
  // const { data: group } = await supabase
  //   .from('groups')
  //   .select('name')
  //   .eq('id', groupId)
  //   .single()

  // 使用假資料進行測試
  const currentGroupData = MOCK_USER_GROUPS.find(g => g.id === groupId)
  const groupName = currentGroupData?.name ?? '未命名小組'

  // 獲取該小組的假資料
  const mockData = getMockDataByGroupId(groupId)

  // 優先使用真實數據的統計信息，但保留 mock 數據的圖表和成員排行
  const displayData = perf ? {
    ...mockData,
    totalConsensusStocks: perf.totalConsensusStocks,
    activeStocks: perf.activeStocks,
    closedStocks: perf.closedStocks,
    groupAverageReturnPct: perf.groupAverageReturnPct,
    groupMedianReturnPct: perf.groupMedianReturnPct,
    groupWinRate: perf.groupWinRate,
    totalFollowers: perf.totalFollowers,
  } : mockData

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold">小組績效</h2>
          {groups.length > 1 && (
            <GroupSwitcher groups={groups} currentGroupId={groupId} />
          )}
        </div>
        <p className="text-sm text-muted-foreground">所有數據以百分比報酬率為主</p>
      </div>

      <div className="space-y-6">
        {/* Performance Chart - Always Show */}
        <div>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PerformanceChart
                groupName={groupName}
                data={displayData.performanceData}
                currentReturnPct={displayData.groupAverageReturnPct}
              />
              {!perf || perf.totalConsensusStocks === 0 ? (
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
                  📊 目前顯示示例數據。完成交易結案後將顯示真實績效。
                </p>
              ) : null}
            </div>

            {/* Member Rankings */}
            <div>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">成員平均報酬率排行</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {displayData.memberRankings.map((member, idx) => (
                      <div key={member.userId} className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-1">
                            <span className="font-semibold text-sm">{idx + 1}.</span>
                            <p className="text-sm font-medium">{member.displayName}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {member.tradeCount} 筆交易 · 勝率 {member.winRate}%
                          </p>
                        </div>
                        <p className="text-right font-bold text-base whitespace-nowrap">
                          {member.averageReturnPct > 0 ? '+' : ''}{member.averageReturnPct.toFixed(2)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Summary Cards - Show if there's real or mock data */}
        {displayData && displayData.totalConsensusStocks > 0 ? (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4">績效統計</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">小組平均報酬率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${displayData.groupAverageReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {displayData.groupAverageReturnPct.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">小組中位數報酬率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${displayData.groupMedianReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {displayData.groupMedianReturnPct.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">小組勝率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{displayData.groupWinRate.toFixed(0)}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">共識標的數量統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{displayData.totalConsensusStocks}</p>
                    <p className="text-xs text-muted-foreground">
                      持有中 {displayData.activeStocks} / 已結案 {displayData.closedStocks}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">說明</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>• 平均報酬率 = 所有已結案交易的報酬率平均（不加權投入金額）</p>
                <p>• 中位數報酬率 = 所有已結案交易報酬率的中位數</p>
                <p>• 勝率 = 獲利交易數 / 已結案交易總數</p>
                <p>• 總跟進人次: {displayData.totalFollowers}</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  )
}
