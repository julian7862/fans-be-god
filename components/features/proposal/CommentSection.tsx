'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { addCommentAction, updateCommentAction, deleteCommentAction } from '@/app/proposals/[proposalId]/actions'
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
  currentUserId: string
}

export function CommentSection({ proposalId, comments, currentUserId }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editPending, startEditTransition] = useTransition()

  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  function startEdit(comment: typeof comments[number]) {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditContent('')
  }

  function handleEdit(id: string) {
    if (!editContent.trim()) return
    startEditTransition(async () => {
      const formData = new FormData()
      formData.set('content', editContent.trim())
      const result = await updateCommentAction(id, proposalId, formData)
      if (!result?.error) cancelEdit()
    })
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteCommentAction(id, proposalId)
    setDeletingId(null)
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">尚無討論</p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="rounded-lg border p-3">
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(comment.id)} disabled={editPending || !editContent.trim()}>
                      {editPending ? '儲存中...' : '儲存'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={editPending}>
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{comment.users.display_name}</span>
                      {comment.comment_type !== 'general' && (
                        <Badge variant="outline" className="text-xs">
                          {commentTypeLabels[comment.comment_type]}
                        </Badge>
                      )}
                      <span>{new Date(comment.created_at).toLocaleDateString('zh-TW')}</span>
                    </div>
                    {comment.user_id === currentUserId && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(comment)}>
                          編輯
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(comment.id)} disabled={deletingId === comment.id}>
                          {deletingId === comment.id ? '刪除中...' : '刪除'}
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </>
              )}
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
