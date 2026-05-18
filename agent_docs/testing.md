# Testing Strategy

## Framework Setup

| Type | Tool | Config |
|------|------|--------|
| Unit tests | Vitest | `vitest.config.ts` |
| Component tests | Vitest + Testing Library | same config |
| E2E tests | Playwright | `playwright.config.ts` |
| Pre-commit | Husky + lint-staged | `.husky/pre-commit` |

---

## Unit Tests (Vitest)

Priority: **test all calculation and business logic functions first.**

### Must-test functions

```
lib/performance/calculateReturn.ts
  - calculateSingleReturnPct(buyPrice, sellPrice)
  - calculateAverageBuyCost(lots)
  - calculateUnrealizedReturnPct(currentPrice, avgCost)
  - calculateRealizedReturnPct(realizedPnl, investedCost)
  - calculateAnnualizedReturnPct(holdingReturnPct, holdingDays)

lib/performance/calculateMedian.ts
  - calculateMedianReturnPct(memberReturns)

lib/performance/calculateWinRate.ts
  - calculateWinRate(memberReturns)
  - calculateAverageWinPct(memberReturns)
  - calculateAverageLossPct(memberReturns)
  - calculateProfitLossRatio(avgWinPct, avgLossPct)

lib/performance/calculateConsensusMetrics.ts
  - calculateConsensusMetrics(memberReturns)
  - calculateGroupAverageReturnPct(memberReturns)
  - calculateGroupTotalAverageReturnPct(consensusStockReturns)

lib/consensus/checkConsensusEligibility.ts
  - checkConsensusEligibility(proposalId)
  - All 8 threshold conditions tested individually
```

### Example unit test

```typescript
// tests/unit/calculateReturn.test.ts
import { describe, it, expect } from 'vitest'
import { calculateSingleReturnPct, calculateAverageBuyCost } from '@/lib/performance/calculateReturn'

describe('calculateSingleReturnPct', () => {
  it('returns correct positive return', () => {
    expect(calculateSingleReturnPct(100, 120)).toBe(20)
  })

  it('returns correct negative return', () => {
    expect(calculateSingleReturnPct(100, 80)).toBe(-20)
  })

  it('returns 0 when buy == sell', () => {
    expect(calculateSingleReturnPct(100, 100)).toBe(0)
  })
})

describe('calculateAverageBuyCost', () => {
  it('calculates weighted average for multiple buy lots', () => {
    const lots = [
      { action: 'buy', price: 100, quantity: 10 },
      { action: 'buy', price: 120, quantity: 10 },
    ]
    expect(calculateAverageBuyCost(lots)).toBe(110)
  })

  it('ignores sell lots', () => {
    const lots = [
      { action: 'buy', price: 100, quantity: 10 },
      { action: 'sell', price: 150, quantity: 5 },
    ]
    expect(calculateAverageBuyCost(lots)).toBe(100)
  })
})
```

---

## Integration Tests

Test the full happy-path flow through the database:

```
Create group
→ Invite member
→ Create proposal
→ Add 3 bull points
→ Add 2 risk points
→ Assign bear reviewer
→ Submit 2 member scores (avg ≥ 75)
→ Submit 2 member votes (agree ratio ≥ 70%)
→ checkConsensusEligibility → passed = true
→ Approve proposal → consensus stock created
→ Member records buy (price, quantity)
→ Member records sell
→ calculateSingleReturnPct called
→ calculateConsensusMetrics returns correct avg, median, win rate
```

Use a dedicated test Supabase project or local Supabase instance for integration tests.

---

## E2E Tests (Playwright)

Core happy-path scenarios:

```typescript
// tests/e2e/auth.spec.ts
test('user can sign up and log in', async ({ page }) => {
  // signup → login → redirected to /groups
})

// tests/e2e/group.spec.ts
test('user can create a group', async ({ page }) => {
  // login → /groups/new → fill form → submit → redirected to /groups/[id]
})

// tests/e2e/proposal.spec.ts
test('member can create a proposal', async ({ page }) => {
  // login → navigate to group → /proposals/new → fill → submit
})

// tests/e2e/consensus.spec.ts
test('proposal passes consensus threshold and appears in consensus list', async ({ page }) => {
  // add bull/risk points → score → vote → approve → appears in /groups/[id]/consensus
})

// tests/e2e/trade.spec.ts
test('member can record buy and sell, return is calculated', async ({ page }) => {
  // navigate to consensus stock → record buy → record sell → return % shown correctly
})
```

---

## Pre-Commit Hooks

```bash
# .husky/pre-commit
npm run lint
npm run build  # catches type errors
npm test       # unit tests only (fast)
```

Do NOT run E2E in pre-commit (too slow). Run E2E in CI instead.

---

## Manual Checks After Each Feature

- [ ] Feature works on desktop Chrome
- [ ] Feature works on mobile viewport (375px)
- [ ] Error state shows correctly (e.g., submit with missing required fields)
- [ ] Loading state visible on async actions
- [ ] Empty state handled (e.g., no proposals yet)
- [ ] No browser console errors

---

## Verification Loop

After implementing any feature:

1. `npm run build` — must pass
2. `npm run lint` — must pass  
3. `npm test` — all unit tests pass
4. Manual browser check (desktop + mobile)
5. Only then mark the task complete
