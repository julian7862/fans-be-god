# Tech Stack & Tools

## Stack Overview

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router) + React + TypeScript |
| UI Components | Tailwind CSS + shadcn/ui |
| Backend | Next.js Server Actions + API Routes |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password; Google OAuth in V2) |
| Hosting | Vercel |
| Charts | Recharts |
| Form Validation | Zod |
| ORM | Supabase JS Client (direct queries, no Prisma in MVP) |
| Error Tracking | Sentry (add after MVP is functional) |
| Analytics | Vercel Analytics (add after MVP is functional) |
| Testing (unit) | Vitest |
| Testing (E2E) | Playwright |

---

## Setup Commands

```bash
# Create project
npx create-next-app@latest investment-consensus-app \
  --typescript --tailwind --eslint --app --src-dir

cd investment-consensus-app

# Install Supabase
npm install @supabase/supabase-js @supabase/ssr

# Install shadcn/ui (run then add components as needed)
npx shadcn@latest init
npx shadcn@latest add button card badge dialog table tabs form progress

# Install Zod + React Hook Form
npm install zod react-hook-form @hookform/resolvers

# Install Recharts
npm install recharts

# Install testing tools
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event
npm install -D playwright @playwright/test

# Install Sentry (add after MVP)
npm install @sentry/nextjs
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_postgres_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
SENTRY_DSN=your_sentry_dsn
```

---

## Project Structure

```
investment-consensus-app/
├── app/
│   ├── page.tsx                    # Landing / redirect to /groups
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── groups/
│   │   ├── page.tsx                # My groups list
│   │   ├── new/page.tsx            # Create group
│   │   └── [groupId]/
│   │       ├── page.tsx            # Group dashboard
│   │       ├── proposals/
│   │       │   ├── page.tsx        # Proposal pool
│   │       │   └── new/page.tsx    # New proposal form
│   │       ├── consensus/page.tsx  # Consensus stock list
│   │       ├── performance/page.tsx
│   │       └── rankings/page.tsx
│   ├── proposals/[proposalId]/page.tsx
│   ├── consensus/
│   │   ├── [consensusStockId]/page.tsx
│   │   ├── [consensusStockId]/trade/page.tsx
│   │   └── [consensusStockId]/review/page.tsx
│   └── api/
│       ├── groups/route.ts
│       ├── proposals/route.ts
│       └── ...
│
├── components/
│   ├── ui/                         # shadcn/ui wrappers if needed
│   └── features/
│       ├── group/
│       ├── proposal/
│       ├── consensus/
│       ├── performance/
│       ├── ranking/
│       └── review/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client (for Server Components)
│   │   └── middleware.ts
│   ├── performance/
│   │   ├── calculateReturn.ts
│   │   ├── calculateMedian.ts
│   │   ├── calculateWinRate.ts
│   │   └── calculateConsensusMetrics.ts
│   ├── consensus/
│   │   └── checkConsensusEligibility.ts
│   ├── validation/
│   │   ├── proposalSchema.ts
│   │   └── tradeRecordSchema.ts
│   └── utils/
│
├── types/
│   ├── group.ts
│   ├── proposal.ts
│   ├── trade.ts
│   └── performance.ts
│
├── db/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

---

## Example Component Pattern

```typescript
// components/features/proposal/ProposalCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StockProposal } from '@/types/proposal'

type ProposalCardProps = {
  proposal: StockProposal
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {proposal.ticker}
          <Badge variant="outline">{proposal.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{proposal.stockName}</p>
        <p className="mt-2 text-sm">{proposal.investmentThesis}</p>
      </CardContent>
    </Card>
  )
}
```

---

## Error Handling Pattern

```typescript
// lib/utils/result.ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// Usage in Server Actions:
export async function createGroup(
  input: CreateGroupInput
): Promise<Result<Group>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('groups')
      .insert(input)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (e) {
    return { success: false, error: 'Unexpected error' }
  }
}
```

---

## Naming Conventions

- **Files:** `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- **Components:** PascalCase (`ProposalCard`, `VotePanel`)
- **Functions:** camelCase (`calculateReturnPct`, `checkConsensusEligibility`)
- **Database columns:** `snake_case` (Supabase convention)
- **TypeScript types/interfaces:** PascalCase (`StockProposal`, `TradeRecord`)
- **Zod schemas:** camelCase with `Schema` suffix (`proposalSchema`, `tradeRecordSchema`)
- **Server Actions:** verb + noun (`createGroup`, `submitVote`, `approveProposal`)

---

## Dev Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build + type check
npm run lint      # ESLint
npm test          # Vitest unit tests
npm run test:e2e  # Playwright E2E tests
```
