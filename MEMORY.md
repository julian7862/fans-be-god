# MEMORY.md — 共同選股研究室 Agent Memory

> Update this file as the project progresses. It is the live state of the build.

---

## Active Phase & Goal

**All 7 phases complete.** MVP code is built.  
**Next:** Connect Supabase credentials, run migration, test in browser, deploy to Vercel.

---

## Completed Milestones

### Phase 1 — Foundation (Done)
- [x] Next.js 16 + TypeScript + Tailwind + shadcn/ui initialized
- [x] Supabase client wrappers (browser + server) + auth middleware
- [x] Full 13-table database schema with RLS policies
- [x] Auth pages (login/signup with Zod validation)
- [x] Group CRUD (create, list, dashboard, invite members)
- [x] Nav bar (auth-aware), landing page
- [x] Performance calculation library with 36 unit tests
- [x] Build passes, all tests green

### Phase 2 — Proposal Pool (Done)
- [x] Proposal service (create, list, get, update, delete, status transitions)
- [x] Proposal validation schema (Zod)
- [x] Proposals list page with status filters
- [x] New proposal form (full fields, validated)
- [x] Proposal detail page (thesis, price info, sidebar)
- [x] Navigation from group dashboard → proposal pool
- [x] Build passes (12 routes), 36 tests green

### Phase 3 — Discussion (Done)
- [x] Bull points: add/list with category, delete own
- [x] Risk points: add/list with severity, delete own, insufficiency warning
- [x] Comments/discussion thread
- [x] Bear reviewer assignment (with validation)
- [x] Risk sufficiency auto-check against group threshold

### Phase 4 — Score & Vote (Done)
- [x] 5-dimension scoring (1-20 each, total 100) with upsert
- [x] Voting (agree/disagree/need_more_info/watch_later) with upsert
- [x] Full 8-condition consensus eligibility check
- [x] Approve flow: creates consensus_stock + updates proposal status
- [x] ConsensusCheckPanel shows missing items + warnings
- [x] Only owner/admin can approve

### Phase 5 — Trade Records (Done)
- [x] Consensus stock list + detail pages
- [x] Follow action, buy/sell record forms
- [x] Auto-calculate realized return % on sell
- [x] Member follow-up table with return %
- [x] Group metrics (avg return, median, win rate) on consensus detail

### Phase 6 — Performance Dashboard (Done)
- [x] Group performance summary (avg, median, win rate, stock counts)
- [x] Member rankings (min 3 trades to qualify)
- [x] Consensus stock rankings (min 2 followers to qualify)
- [x] Navigation from group dashboard

### Phase 7 — Review (Done)
- [x] Review form: thesis valid, target reached, stop-loss triggered, risks happened, correct/wrong judgements, lessons, improvement
- [x] Existing reviews displayed per consensus stock
- [x] Link from consensus detail page
- [x] Build passes (18 routes), 36 tests green

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Modern pattern, supports Server Components + Server Actions |
| Supabase over custom backend | Auth + DB + RLS in one service, free tier fits MVP |
| shadcn/ui | Consistent, accessible components; AI tools generate it well |
| Zod for all validation | Runtime safety at API and form boundaries |
| No real-time stock prices in MVP | Reduces scope; users enter prices manually |
| No AI features in MVP | Scope control; AI review/summary planned for V2 |
| Percentage-based rankings only | Fairness; prevents wealth bias in leaderboard |
| z.number() over z.coerce.number() | Zod v4 coerce has type inference issues with react-hook-form |

---

## Known Issues / Blockers

- Next.js 16 shows "middleware deprecated, use proxy" warning — still functional, can migrate later
- Supabase credentials not yet configured (user needs to create project and fill .env.local)

---

## Open Questions

- Should we support invite links (shareable URL) in addition to email-based invite?
- Should proposal editing be allowed after "discussion" status?
