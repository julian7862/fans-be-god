# Code Patterns

## Server Actions (preferred over API routes for mutations)

```typescript
// app/groups/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { groupSchema } from '@/lib/validation/groupSchema'
import { revalidatePath } from 'next/cache'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = groupSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('groups')
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/groups')
  return { data }
}
```

---

## Zod Validation Schemas

```typescript
// lib/validation/proposalSchema.ts
import { z } from 'zod'

export const proposalSchema = z.object({
  ticker: z.string().min(1, '請輸入股票代號'),
  stockName: z.string().min(1, '請輸入股票名稱'),
  market: z.string().optional(),
  proposalPrice: z.number().positive().optional(),
  investmentThesis: z.string().min(20, '買進邏輯至少需要 20 個字'),
  targetPrice: z.number().positive('目標價必須大於 0'),
  stopLossPrice: z.number().positive().optional(),
  exitCondition: z.string().optional(),
  expectedHoldingDays: z.number().int().positive().optional(),
}).refine(
  data => data.stopLossPrice || data.exitCondition,
  { message: '請至少填寫停損價或退出條件', path: ['exitCondition'] }
)

export type ProposalInput = z.infer<typeof proposalSchema>
```

---

## TypeScript Types

```typescript
// types/proposal.ts
export type ProposalStatus =
  | 'draft' | 'submitted' | 'discussion' | 'risk_insufficient'
  | 'bear_review' | 'voting' | 'approved' | 'rejected' | 'watchlist' | 'closed'

export type StockProposal = {
  id: string
  groupId: string
  proposerId: string
  ticker: string
  stockName: string
  market: string | null
  proposalPrice: number | null
  proposalDate: string
  investmentThesis: string
  targetPrice: number | null
  stopLossPrice: number | null
  exitCondition: string | null
  expectedHoldingDays: number | null
  status: ProposalStatus
  bearReviewerId: string | null
  createdAt: string
  updatedAt: string
}
```

---

## Data Fetching (Server Components)

```typescript
// app/groups/[groupId]/proposals/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProposalCard } from '@/components/features/proposal/ProposalCard'

export default async function ProposalsPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: proposals } = await supabase
    .from('stock_proposals')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      {proposals?.map(p => <ProposalCard key={p.id} proposal={p} />)}
    </div>
  )
}
```

---

## Consensus Check (core business logic)

```typescript
// lib/consensus/checkConsensusEligibility.ts
import type { ConsensusCheckResult } from '@/types/consensus'

export async function checkConsensusEligibility(
  proposalId: string,
  supabase: SupabaseClient
): Promise<ConsensusCheckResult> {
  // Fetch proposal, group settings, votes, scores, bull/risk points
  // Check all 8 conditions
  // Return { passed, agreeRatio, averageScore, missingItems, warnings }
}
```

Full implementation is in `docs/TechDesign-Fans-be-god-MVP.md` Section 5.2.

---

## Performance Calculation (pure functions)

```typescript
// lib/performance/calculateReturn.ts

export function calculateSingleReturnPct(
  buyPrice: number,
  sellPrice: number
): number {
  return ((sellPrice - buyPrice) / buyPrice) * 100
}

export function calculateAverageBuyCost(
  lots: Array<{ action: 'buy' | 'sell'; price: number; quantity: number }>
): number {
  const buyLots = lots.filter(l => l.action === 'buy')
  const totalAmount = buyLots.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const totalQty = buyLots.reduce((sum, l) => sum + l.quantity, 0)
  return totalQty === 0 ? 0 : totalAmount / totalQty
}
```

Full calculation library is specified in `docs/TechDesign-Fans-be-god-MVP.md` Sections 6.1–6.12.

---

## Row Level Security Patterns

```sql
-- Only group members can view proposals in their group
CREATE POLICY "Members can view group proposals"
ON stock_proposals FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- Users can only edit their own trade records
CREATE POLICY "Users can update own trade records"
ON trade_records FOR UPDATE
USING (user_id = auth.uid());
```

---

## Form with React Hook Form + Zod

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { proposalSchema, type ProposalInput } from '@/lib/validation/proposalSchema'

export function ProposalForm() {
  const form = useForm<ProposalInput>({
    resolver: zodResolver(proposalSchema),
  })

  async function onSubmit(data: ProposalInput) {
    // call server action
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* fields */}
    </form>
  )
}
```

---

## Ranking — Percentage Only

```typescript
// CORRECT: rank by return percentage
const ranked = members.sort((a, b) => b.averageReturnPct - a.averageReturnPct)

// WRONG: never rank by absolute profit
// const ranked = members.sort((a, b) => b.totalProfit - a.totalProfit)  ← FORBIDDEN
```

---

## Privacy Guard

```typescript
// When returning trade records via API, always filter sensitive fields
function toPublicTradeRecord(record: TradeRecord, requestUserId: string) {
  if (record.userId === requestUserId) return record  // own record: full data
  return {
    ...record,
    investedAmount: null,    // hide amount from others
    quantity: null,          // hide quantity from others
    realizedPnl: null,       // hide absolute profit
  }
}
```
