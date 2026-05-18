# Review Checklist — 共同選股研究室

Use before marking any phase complete or creating a PR.

---

## Code Quality

- [ ] No `any` types — use `unknown` with type guards
- [ ] All functions have typed parameters and return types
- [ ] Zod schemas validate all form inputs and API inputs
- [ ] No business logic in route handlers — logic is in `lib/`
- [ ] No direct DB calls from components or pages

## Security

- [ ] Row Level Security enabled on all Supabase tables
- [ ] All API routes check user is authenticated
- [ ] All API routes verify user belongs to the relevant group
- [ ] No personal invested amounts exposed in public responses
- [ ] Input validated on server side (not just client)

## Tests

- [ ] Unit tests pass for all calculation functions
- [ ] Integration test covers the full proposal → consensus → trade flow
- [ ] E2E test covers the happy path for the feature
- [ ] `npm run build` passes with no type errors
- [ ] `npm run lint` passes

## UI / UX

- [ ] Tested on mobile viewport (375px)
- [ ] Error states displayed to user (not silent failures)
- [ ] Loading states present for async actions
- [ ] Empty states handled (no proposals, no members, etc.)

## Business Logic

- [ ] Consensus threshold check includes all 8 conditions
- [ ] Rankings display percentage return, NOT absolute profit
- [ ] Personal invested amounts are not publicly visible by default
- [ ] All consensus stocks preserve full decision record

## Pre-Commit

- [ ] Pre-commit hooks pass (lint + type check + tests)
- [ ] No `.env` secrets committed
- [ ] No `console.log` left in production code
- [ ] Database migrations included for any schema changes
