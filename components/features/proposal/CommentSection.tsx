'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { addCommentAction } from '@/app/proposals/[proposalId]/actions'
import type { ProposalComment, CommentType } from '@/types/proposal'

const commentTypeLabels: Record<CommentType, string> = {
  general: '一般',
  question: '提問',
  bear_argument: '反方觀點',
  clarification: '補充說明',
  follow_up: '後續追蹤',
}

type CommentSectionProps = {
  proposalId: string
  comments: (ProposalComment & { users: { display_name: string } })[]
}

export function CommentSection({ proposalId, comments }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!content.trim()) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('content', content)

    const result = await addCommentAction(proposalId, formData)
    if (result?.error) {
      setError(typeof result.error === 'string' ? result.error : '留言失敗')
    } else {
      setContent('')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">尚無討論</p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{comment.users.display_name}</span>
                {comment.comment_type !== 'general' && (
                  <Badge variant="outline" className="text-xs">
                    {commentTypeLabels[comment.comment_type]}
                  </Badge>
                )}
                <span>{new Date(comment.created_at).toLocaleDateString('zh-TW')}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <Textarea
          placeholder="加入討論..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleAdd} disabled={loading || !content.trim()}>
            {loading ? '送出中...' : '送出留言'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
