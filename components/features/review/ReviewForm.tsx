'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createReviewAction } from '@/app/consensus/[consensusStockId]/review/actions'

type ReviewFormProps = {
  consensusStockId: string
  groupId: string
}

export function ReviewForm({ consensusStockId, groupId }: ReviewFormProps) {
  const [thesisValid, setThesisValid] = useState('')
  const [targetReached, setTargetReached] = useState('')
  const [stopLossTriggered, setStopLossTriggered] = useState('')
  const [risksHappened, setRisksHappened] = useState('')
  const [correctJudgements, setCorrectJudgements] = useState('')
  const [wrongJudgements, setWrongJudgements] = useState('')
  const [lessonLearned, setLessonLearned] = useState('')
  const [nextTimeImprovement, setNextTimeImprovement] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('thesisValid', thesisValid)
    formData.set('targetReached', targetReached)
    formData.set('stopLossTriggered', stopLossTriggered)
    formData.set('risksHappened', risksHappened)
    formData.set('correctJudgements', correctJudgements)
    formData.set('wrongJudgements', wrongJudgements)
    formData.set('lessonLearned', lessonLearned)
    formData.set('nextTimeImprovement', nextTimeImprovement)

    const result = await createReviewAction(consensusStockId, groupId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : '提交失敗')
    } else {
      setSuccess(true)
      setRisksHappened('')
      setCorrectJudgements('')
      setWrongJudgements('')
      setLessonLearned('')
      setNextTimeImprovement('')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-green-600 font-medium">復盤已提交</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Boolean questions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>買進邏輯是否成立？</Label>
          <Select value={thesisValid} onValueChange={v => setThesisValid(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="選擇" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">成立</SelectItem>
              <SelectItem value="false">不成立</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>目標價是否達成？</Label>
          <Select value={targetReached} onValueChange={v => setTargetReached(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="選擇" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">達成</SelectItem>
              <SelectItem value="false">未達成</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>停損是否觸發？</Label>
          <Select value={stopLossTriggered} onValueChange={v => setStopLossTriggered(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="選擇" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">觸發</SelectItem>
              <SelectItem value="false">未觸發</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Text fields */}
      <div className="space-y-2">
        <Label>哪些風險真的發生了？</Label>
        <Textarea rows={2} value={risksHappened} onChange={e => setRisksHappened(e.target.value)} placeholder="列出實際發生的風險事件" />
      </div>

      <div className="space-y-2">
        <Label>哪裡判斷正確？</Label>
        <Textarea rows={2} value={correctJudgements} onChange={e => setCorrectJudgements(e.target.value)} placeholder="這次決策做對了什麼" />
      </div>

      <div className="space-y-2">
        <Label>哪裡判斷錯誤？</Label>
        <Textarea rows={2} value={wrongJudgements} onChange={e => setWrongJudgements(e.target.value)} placeholder="這次決策做錯了什麼" />
      </div>

      <div className="space-y-2">
        <Label>學到的教訓</Label>
        <Textarea rows={2} value={lessonLearned} onChange={e => setLessonLearned(e.target.value)} placeholder="這次經驗學到什麼" />
      </div>

      <div className="space-y-2">
        <Label>下次可以怎麼改善？</Label>
        <Textarea rows={2} value={nextTimeImprovement} onChange={e => setNextTimeImprovement(e.target.value)} placeholder="下次遇到類似情況，要怎麼做得更好" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button className="w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? '提交中...' : '提交復盤'}
      </Button>
    </div>
  )
}
