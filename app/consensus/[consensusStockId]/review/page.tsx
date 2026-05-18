import { createClient } from '@/lib/supabase/server'
import { getConsensusStockById } from '@/lib/trade/service'
import { getReviews } from '@/lib/review/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReviewForm } from '@/components/features/review/ReviewForm'

export default async function ReviewPage({
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
  const reviewsResult = await getReviews(consensusStockId)
  const reviews = reviewsResult.success ? reviewsResult.data : []

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">復盤 — {stock.ticker} {stock.stock_name}</h1>
          <p className="text-sm text-muted-foreground">檢討決策過程，記錄學到的教訓</p>
        </div>
        <Link href={`/consensus/${consensusStockId}`}>
          <Button variant="outline" size="sm">返回標的</Button>
        </Link>
      </div>

      {/* Existing Reviews */}
      {reviews.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-medium">已完成的復盤</h2>
          {reviews.map(review => (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{review.users.display_name}</span>
                  <span>{new Date(review.created_at).toLocaleDateString('zh-TW')}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  {review.thesis_valid !== null && (
                    <Badge variant={review.thesis_valid ? 'default' : 'destructive'}>
                      買進邏輯{review.thesis_valid ? '成立' : '不成立'}
                    </Badge>
                  )}
                  {review.target_reached !== null && (
                    <Badge variant={review.target_reached ? 'default' : 'secondary'}>
                      目標價{review.target_reached ? '達成' : '未達成'}
                    </Badge>
                  )}
                  {review.stop_loss_triggered !== null && (
                    <Badge variant={review.stop_loss_triggered ? 'destructive' : 'outline'}>
                      停損{review.stop_loss_triggered ? '觸發' : '未觸發'}
                    </Badge>
                  )}
                </div>
                {review.risks_happened && (
                  <div><span className="font-medium">實際發生的風險：</span>{review.risks_happened}</div>
                )}
                {review.correct_judgements && (
                  <div><span className="font-medium">判斷正確：</span>{review.correct_judgements}</div>
                )}
                {review.wrong_judgements && (
                  <div><span className="font-medium">判斷錯誤：</span>{review.wrong_judgements}</div>
                )}
                {review.lesson_learned && (
                  <div><span className="font-medium">學到的教訓：</span>{review.lesson_learned}</div>
                )}
                {review.next_time_improvement && (
                  <div><span className="font-medium">下次改善：</span>{review.next_time_improvement}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Review Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">新增復盤</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewForm consensusStockId={consensusStockId} groupId={stock.group_id} />
        </CardContent>
      </Card>
    </div>
  )
}
