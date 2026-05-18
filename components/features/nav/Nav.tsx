import Link from 'next/link'
import { AuthStatus } from './AuthStatus'

export function Nav() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/groups" className="font-bold">
          共同選股研究室
        </Link>
        <nav className="flex items-center gap-4">
          <AuthStatus />
        </nav>
      </div>
    </header>
  )
}
