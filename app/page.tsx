import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/frontpage')

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        共同選股研究室
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        和朋友一起研究、決策、投資、復盤。
        <br />
        不喊單、不比本金、只比紀律。
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/signup">
          <Button size="lg">開始使用</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="lg">登入</Button>
        </Link>
      </div>
    </div>
  )
}
