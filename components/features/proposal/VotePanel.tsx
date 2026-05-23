'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { ProposalVote, VoteValue } from '@/types/proposal'

const voteOptions: { value: VoteValue; label: string; emoji: string }[] = [
  { value: 'agree', label: '同意', emoji: '👍' },
  { value: 'disagree', label: '反對', emoji: '👎' },
]

type VotePanelProps = {
  proposalId: string
  myVote: ProposalVote | null
  allVotes: (ProposalVote & { users: { display_name: string } })[]
  onSubmitVote: (proposalId: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export function VotePanel({ proposalId, myVote, allVotes, onSubmitVote }: VotePanelProps) {
  const [selectedVote, setSelectedVote] = useState<VoteValue | null>(myVote?.vote ?? null)
  const [reason, setReason] = useState(myVote?.reason ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [optimisticVotes, addOptimisticVote] = useOptimistic(
    allVotes,
    (current, newVote: VoteValue) => {
      const existing = current.find(v => v.user_id === myVote?.user_id)
      if (existing) {
        return current.map(v => v.user_id === myVote?.user_id ? { ...v, vote: newVote } : v)
      }
      return [...current, { id: 'optimistic', proposal_id: proposalId, user_id: 'me', vote: newVote, reason: null, created_at: '', updated_at: '', users: { display_name: '我' } }]
    }
  )

  const totalVotes = optimisticVotes.length
  const agreeCount = optimisticVotes.filter(v => v.vote === 'agree').length
  const agreeRatio = totalVotes > 0 ? ((agreeCount / totalVotes) * 100).toFixed(0) : '0'

  function handleSubmit() {
    if (!selectedVote) return
    setError(null)

    startTransition(async () => {
      addOptimisticVote(selectedVote)

      const formData = new FormData()
      formData.set('vote', selectedVote)
      if (reason.trim()) formData.set('reason', reason.trim())

      const result = await onSubmitVote(proposalId, formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">已投票: {totalVotes} 人</span>
        {totalVotes > 0 && <Badge variant="secondary">同意 {agreeRatio}%</Badge>}
      </div>

      {/* Vote buttons */}
      <div className="grid grid-cols-2 gap-2">
        {voteOptions.map(opt => (
          <Button
            key={opt.value}
            variant={selectedVote === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedVote(opt.value)}
          >
            {opt.emoji} {opt.label}
          </Button>
        ))}
      </div>

      {/* Reason */}
      <Textarea
        placeholder="投票原因（選填）"
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={2}
        className="text-sm"
      />

      <Button
        size="sm"
        className="w-full"
        onClick={handleSubmit}
        disabled={isPending || !selectedVote}
      >
        {isPending ? '送出中...' : myVote ? '更新投票' : '投票'}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Vote list */}
      {optimisticVotes.length > 0 && (
        <div className="border-t pt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">投票記錄</p>
          <div className="space-y-1">
            {optimisticVotes.map(v => (
              <div key={v.id} className="flex justify-between text-xs">
                <span>{v.users.display_name}</span>
                <span>{voteOptions.find(o => o.value === v.vote)?.emoji} {voteOptions.find(o => o.value === v.vote)?.label ?? v.vote}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
