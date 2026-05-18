# Project Brief (Persistent)

## Product Vision

**共同選股研究室** (Investment Consensus Lab) — A group stock research app where friends build a shared investment decision process. The core is NOT about shouting tips or comparing who makes the most money. It is about structured collective decision-making: propose → discuss → score → vote → record → review.

**The four technical pillars that must be rock-solid:**
1. Shared decision-making data structure
2. Consensus threshold logic
3. Percentage-based performance calculation
4. Post-mortem data preservation

---

## Coding Conventions

### TypeScript
- Strict mode enabled
- No `any` — use `unknown` + type guards
- Explicit return types on all exported functions
- Zod for runtime validation at all boundaries

### Architecture
- Pages/routes: request/response only
- Business logic: `lib/` directory (services, calculations, checks)
- DB access: via service functions in `lib/`, never directly from components
- Calculations: `lib/performance/` — pure functions, easy to unit test
- Consensus logic: `lib/consensus/checkConsensusEligibility.ts`

### Components
- Use shadcn/ui primitives first
- Feature components in `components/features/[domain]/`
- Props must be typed (no implicit `any` from spreading objects)

### Database
- Row Level Security on ALL tables
- Users can only read/write data for groups they belong to
- Migrations in `db/migrations/` — numbered sequentially

### Privacy
- `invested_amount` and `quantity` in trade records: private by default, per-user
- Rankings display `%` return only, never absolute dollar amounts
- Leaderboards must have minimum participation threshold to appear

---

## Quality Gates

Before any PR or phase milestone:

1. `npm run build` — zero type errors
2. `npm run lint` — zero lint errors
3. `npm test` — all unit tests pass (especially calculation functions)
4. `npm run test:e2e` — happy path E2E passes
5. Manual browser check on mobile viewport
6. Review checklist in `REVIEW-CHECKLIST.md`

---

## Key Commands

```bash
npm run dev          # Start local dev server
npm run build        # Build + type-check
npm run lint         # Run ESLint
npm test             # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npx supabase start   # Start local Supabase (if using local dev)
npx supabase db push # Apply migrations to remote Supabase
```

---

## Update Cadence

Update this file when:
- A new architectural pattern is established
- A key convention is agreed upon
- A library or approach is locked in or ruled out
- Anything that would confuse a new developer joining mid-project
