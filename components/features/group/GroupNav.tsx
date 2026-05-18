'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type GroupNavProps = {
  groupId: string
}

const tabs = [
  { label: '總覽', href: '' },
  { label: '提案池', href: '/proposals' },
  { label: '共識名單', href: '/consensus' },
  { label: '績效', href: '/performance' },
  { label: '排行榜', href: '/rankings' },
  { label: '設定', href: '/invite' },
]

export function GroupNav({ groupId }: GroupNavProps) {
  const pathname = usePathname()
  const basePath = `/groups/${groupId}`

  function isActive(href: string) {
    const fullPath = basePath + href
    if (href === '') {
      return pathname === basePath || pathname === basePath + '/'
    }
    return pathname.startsWith(fullPath)
  }

  return (
    <nav className="overflow-x-auto border-b">
      <div className="container mx-auto flex max-w-4xl justify-center gap-1 px-4">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={basePath + tab.href}
            className={cn(
              'whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
              'border-b-2 -mb-px',
              isActive(tab.href)
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
