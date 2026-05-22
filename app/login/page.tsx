'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validation/authSchema'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

const KEY_EMAIL = 'login_remembered_email'
const KEY_PASSWORD = 'login_remembered_password'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    const email = localStorage.getItem(KEY_EMAIL) ?? ''
    const password = localStorage.getItem(KEY_PASSWORD) ?? ''
    if (email) {
      setValue('email', email)
      setKeepLoggedIn(true)
    }
    if (password) setValue('password', password)
  }, [setValue])

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    setError(null)

    if (keepLoggedIn) {
      localStorage.setItem(KEY_EMAIL, data.email)
      localStorage.setItem(KEY_PASSWORD, data.password)
    } else {
      localStorage.removeItem(KEY_EMAIL)
      localStorage.removeItem(KEY_PASSWORD)
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/groups')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">登入</CardTitle>
          <CardDescription>共同選股研究室</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onCheckedChange={(v) => setKeepLoggedIn(v === true)}
              />
              <Label htmlFor="keepLoggedIn" className="cursor-pointer font-normal">保持登入狀態</Label>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登入中...' : '登入'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            還沒有帳號？{' '}
            <Link href="/signup" className="underline hover:text-primary">
              註冊
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
