'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inviteMemberSchema, type InviteMemberInput } from '@/lib/validation/groupSchema'
import { inviteMemberAction } from '@/app/groups/actions'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InviteMemberPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
  })

  async function onSubmit(data: InviteMemberInput) {
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.set('email', data.email)

    const result = await inviteMemberAction(groupId, formData)

    if (result?.error) {
      const msg = typeof result.error === 'string' ? result.error : '請檢查輸入內容'
      setError(msg)
      toast.error(msg)
    } else if (result?.success) {
      setSuccessMsg(result.message ?? '邀請成功')
      toast.success('邀請成功')
      reset()
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>邀請成員</CardTitle>
          <CardDescription>輸入對方的 Email 邀請加入小組（對方需已註冊）</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">成員 Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {successMsg && (
              <p className="text-sm text-green-600">{successMsg}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '邀請中...' : '邀請成員'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
