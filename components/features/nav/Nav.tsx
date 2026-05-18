import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './LogoutButton'

export async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/groups" className="font-bold">
          共同選股研究室
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/groups"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                我的小組
              </Link>
              <span className="text-sm text-muted-foreground">
                {user.user_metadata?.display_name ?? user.email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              登入
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
