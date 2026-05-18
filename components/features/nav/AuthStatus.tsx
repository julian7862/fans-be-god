'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { LogoutButton } from './LogoutButton'
import type { User } from '@supabase/supabase-js'

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="h-5 w-20 animate-pulse rounded bg-muted" />
  }

  if (!user) {
    return (
      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
        登入
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/groups" className="text-sm text-muted-foreground hover:text-foreground">
        我的小組
      </Link>
      <span className="text-sm text-muted-foreground">
        {user.user_metadata?.display_name ?? user.email}
      </span>
      <LogoutButton />
    </div>
  )
}
