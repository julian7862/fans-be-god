# AGENTS.md — 共同選股研究室 MVP

> Universal instruction file for all AI coding assistants (Claude Code, Cursor, Gemini CLI, Copilot).
> Read this file at the start of every session.

---

## Project Overview

**Product:** 共同選股研究室 (Investment Consensus Lab)  
**One-liner:** A group stock research app where friends build a shared investment decision process — propose, discuss, score, vote, record, and review together.  
**Stage:** MVP Development  
**Stack:** Next.js + TypeScript + Supabase + Tailwind CSS + shadcn/ui  
**Deployment:** Vercel  

**Core philosophy:** This app is NOT about shouting tips or competing on who earns more money. It is about building a shared, structured decision-making process for a group of friends investing together.

---

## How I Should Think

1. **Understand Intent First** — Before answering, identify what the user actually needs
2. **Ask If Unsure** — If critical information is missing, ask ONE clarifying question before proceeding
3. **Plan Before Coding** — Propose a brief plan and wait for approval, then implement
4. **Verify After Changes** — Run tests/linters or manual checks after each change
5. **Explain Trade-offs** — When recommending an approach, mention the alternative

---

## What NOT To Do

- Do NOT delete files without explicit confirmation
- Do NOT modify database schemas without a migration plan
- Do NOT add features not in the current phase
- Do NOT skip tests for "simple" changes
- Do NOT bypass failing tests or pre-commit hooks
- Do NOT use deprecated libraries or patterns
- Do NOT rank users by absolute profit amount — use percentage return only
- Do NOT expose personal invested amounts publicly by default
- Do NOT let voting replace research (enforce bull/risk point minimums)

---

## Engineering Constraints

### Type Safety
- The `any` type is FORBIDDEN — use `unknown` with type guards
- All function parameters and return types must be explicitly typed
- Use Zod for all runtime validation at system boundaries (forms, API inputs)

### Architecture
- Routes/pages handle request/response ONLY
- All business logic goes in `lib/` (services, calculations, consensus checks)
- No direct database calls from route handlers — use service functions
- Performance calculations live in `lib/performance/`
- Consensus logic lives in `lib/consensus/`

### Library Governance
- Check existing `package.json` before suggesting new dependencies
- Prefer native fetch over axios
- Use shadcn/ui components before rolling custom UI
- Data fetching: Next.js Server Components + Server Actions (not client-side fetch)

### Communication
- State issues briefly and fix them; do not repeat apologies
- If context is missing, ask ONE specific clarifying question before proceeding

### Workflow
- Pre-commit hooks must pass before commits
- If verification fails, fix before continuing
- Build one feature at a time, test before moving on

---

## Current Phase & Active Goal

> See `MEMORY.md` for up-to-date phase status.

**Phase 1 — Foundation:** Auth + Group creation + basic Dashboard  
**Status:** 🔴 Not started

### Phase Roadmap

| Phase | Name | Goal |
|-------|------|------|
| 1 | Foundation | Auth, groups, invite members, dashboard shell |
| 2 | Proposal Pool | Create proposals, list, detail, status |
| 3 | Discussion | Bull points, risk points, comments, bear reviewer |
| 4 | Score & Vote | Scoring, voting, consensus check, approve → consensus stock |
| 5 | Trade Records | Follow/buy/sell records, personal return % |
| 6 | Performance Dashboard | Group avg return, median, win rate, basic ranking |
| 7 | Review | Post-mortem form, risk hit tracking, lessons learned |

---

## Detailed Documentation

| Topic | File |
|-------|------|
| Full tech stack & setup commands | `agent_docs/tech_stack.md` |
| Project conventions & key commands | `agent_docs/project_brief.md` |
| All features & user stories | `agent_docs/product_requirements.md` |
| Testing strategy | `agent_docs/testing.md` |
| Code patterns & examples | `agent_docs/code_patterns.md` |

---

## Database Tables (Summary)

All 13 tables are defined in `docs/TechDesign-Fans-be-god-MVP.md` Section 4.

```
users, groups, group_members, stock_proposals,
proposal_bull_points, proposal_risk_points, proposal_comments,
proposal_scores, proposal_votes, consensus_stocks,
trade_records, trade_lots, reviews
```

Enable Row Level Security on all tables. Users may only access data for groups they belong to.

---

## Key Business Rules

1. **Consensus threshold (default):** agree ratio ≥ 70%, avg score ≥ 75, bull points ≥ 3, risk points ≥ 2, bear reviewer assigned, thesis + target price + stop-loss/exit filled
2. **All rankings use percentage return** — never absolute profit amounts
3. **Personal invested amount is private by default** — group can opt to show it
4. **Every consensus stock preserves full decision record** — proposal → discussion → scores → votes → trade records → review
5. **Member win rate requires ≥ 3 consensus stocks participated** to appear in ranking (prevents lucky one-shot topping the board)

---

## Performance Calculation Rules

```
single_return_pct = (sell_price - buy_price) / buy_price * 100
unrealized_return_pct = (current_price - avg_cost) / avg_cost * 100
group_stock_avg_return = sum(member_returns) / follower_count
group_total_avg_return = sum(consensus_stock_avg_returns) / consensus_stock_count
```

Group average does NOT weight by invested capital.

---

## Plan → Execute → Verify Loop

For every feature:
1. **Plan:** Write 3–5 bullet approach, ask for approval
2. **Execute:** Implement the single feature
3. **Verify:** Run `npm run build` + `npm test` + manual browser check
4. **Commit:** Only after verification passes

---

## Starting a New Session

```
Read AGENTS.md, then confirm: what phase are we on and what's the next task?
```
