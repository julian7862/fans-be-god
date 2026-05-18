'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGroupSchema, type CreateGroupInput } from '@/lib/validation/groupSchema'
import { createGroupAction } from '@/app/groups/actions'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewGroupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
  })

  async function onSubmit(data: CreateGroupInput) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set('name', data.name)
    if (data.description) formData.set('description', data.description)

    const result = await createGroupAction(formData)
    if (result?.error) {
      const msg = typeof result.error === 'string' ? result.error : '請檢查輸入內容'
      setError(msg)
      toast.error(msg)
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>建立投資小組</CardTitle>
          <CardDescription>建立一個新的共同選股研究小組</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">小組名稱</Label>
              <Input
                id="name"
                placeholder="例如：科技股研究小組"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述（選填）</Label>
              <Textarea
                id="description"
                placeholder="小組目標、投資風格..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '建立中...' : '建立小組'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
