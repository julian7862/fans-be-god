import { createClient } from '@/lib/supabase/server'
import { getGroupsForUser } from '@/lib/group/service'
import { getGroupPerformance } from '@/lib/performance/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PerformanceChart } from '@/components/features/performance/PerformanceChart'

// Mock data for groups
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

const getMockDataByGroupId = (groupId: string) => {
  const isEven = parseInt(groupId.charAt(0)) % 2 === 0

  if (isEven) {
    return {
      performanceData: MOCK_PERFORMANCE_DATA_GROUP1,
      currentReturnPct: 13.4,
    }
  } else {
    return {
      performanceData: MOCK_PERFORMANCE_DATA_GROUP2,
      currentReturnPct: 8.5,
    }
  }
}

export default async function FrontPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all groups (not just user's groups)
  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, description, owner_id, created_at')
    .order('created_at', { ascending: false })

  const allGroups = groups ?? []

  // Fetch performance data for each group
  const groupsWithPerformance = await Promise.all(
    allGroups.map(async (group) => {
      const perfResult = await getGroupPerformance(group.id)
      const perf = perfResult.success ? perfResult.data : null
      const mockData = getMockDataByGroupId(group.id)

      return {
        ...group,
        performance: perf,
        mockData,
      }
    })
  )

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">投資小組績效總覽</h1>
        <p className="text-muted-foreground">所有投資小組的實時績效</p>
      </div>

      {allGroups.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">目前還沒有任何投資小組</p>
          <Link href="/groups/new">
            <Button>建立第一個小組</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
            {groupsWithPerformance.map((group) => {
              const displayData = group.performance || group.mockData

              return (
                <div key={group.id} className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{group.name}</h2>
                    <Link href={`/groups/${group.id}/performance`}>
                      <Button variant="outline" size="sm">詳細績效</Button>
                    </Link>
                  </div>

                  <PerformanceChart
                    groupName={group.name}
                    data={displayData.performanceData}
                    currentReturnPct={displayData.groupAverageReturnPct ?? displayData.currentReturnPct}
                  />

                  {!group.performance ? (
                    <p className="text-sm text-amber-600 dark:text-amber-500">
                      📊 目前顯示示例數據。完成交易結案後將顯示真實績效。
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Link href="/groups">
              <Button variant="outline">管理小組</Button>
            </Link>
            <Link href="/groups/new">
              <Button>建立新小組</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
