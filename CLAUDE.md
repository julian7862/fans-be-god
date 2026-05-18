# CLAUDE.md — Claude Code Configuration for 共同選股研究室

## Project Context

**App:** 共同選股研究室 (Investment Consensus Lab)  
**Stack:** Next.js 14 + TypeScript + Supabase + Tailwind CSS + shadcn/ui  
**Stage:** MVP Development  
**Deployment:** Vercel  

---

## Directives

1. **Master Plan:** Read `AGENTS.md` first every session. It contains the current phase, active tasks, and all behavioral rules.
2. **Documentation:** Refer to `agent_docs/` for full details:
   - `agent_docs/tech_stack.md` — setup commands, project structure, patterns
   - `agent_docs/product_requirements.md` — all features and user stories
   - `agent_docs/code_patterns.md` — code examples and conventions
   - `agent_docs/testing.md` — testing strategy and verification loop
3. **Plan-First:** Propose a 3–5 bullet plan and wait for approval before writing code.
4. **Incremental Build:** One feature at a time. Verify before moving on.
5. **Verify:** After each feature: `npm run build` + `npm test` + manual browser check.
6. **Pre-Commit:** Pre-commit hooks must pass before commits. Fix failures, never bypass.
7. **Communication:** Concise. State issues and fix them. Ask ONE clarifying question if blocked.

---

## Hard Rules (from AGENTS.md)

- No `any` types — use `unknown` with type guards
- No business logic in route handlers — use `lib/`
- No direct DB calls from components — use service functions
- Rankings use `%` return only — never absolute profit or capital amounts
- Personal `invested_amount` and `quantity` are private by default
- Row Level Security must be enabled on all Supabase tables
- Never delete files without explicit confirmation
- Never modify DB schema without a migration plan

---

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build + type check
npm run lint         # ESLint
npm test             # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
```

---

## Starting a Session

Say: **"Read AGENTS.md and MEMORY.md, then tell me what phase we're on and what the next task is."**
