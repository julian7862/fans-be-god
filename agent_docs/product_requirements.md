# Product Requirements

## Product Name

**共同選股研究室** (Investment Consensus Lab)

## Primary User Story

A group of friends want to research stocks together, make collective decisions about which ones to follow, track whether each member bought in, and review what went right or wrong — without any one person just shouting tips, and without competing on who has the most money.

---

## Core Decision Flow

```
Propose ticker
→ Group discusses (add bull points + risk points + comments)
→ At least one bear reviewer challenges the thesis
→ Members score the proposal (5 dimensions, 20 pts each = 100 total)
→ Members vote (agree / disagree / need_more_info / watch_later)
→ System checks consensus threshold
→ If passed → enters Group Consensus List
→ Members choose whether to follow (buy in)
→ Members record buy price, quantity, date
→ Members record sell price when exiting
→ System calculates % return per member
→ System calculates group avg and median return for the stock
→ Group conducts post-mortem review
```

---

## Must-Have Features (MVP)

### Auth
- Email / password signup and login via Supabase Auth
- Protected routes (redirect to /login if unauthenticated)

### Groups
- Create an investment group (name + description)
- Invite members by email or invite link
- Role system: `owner`, `admin`, `member`, `viewer`
- Group settings: consensus thresholds (agree %, avg score, min bull/risk points)

### Group Dashboard (`/groups/[groupId]`)
- Group name and member count
- Active proposal count, voting count, approved consensus count, closed count
- Group average return %, group win rate
- "Pending actions" panel:
  - Proposals you haven't scored yet
  - Proposals you haven't voted on yet
  - Proposals where you're the assigned bear reviewer
  - Holdings you haven't updated sell date for
  - Consensus stocks ready for review

### Proposal Pool
- Create a stock proposal: ticker, stock name, market, proposal price, investment thesis, target price, stop-loss price OR exit condition, expected holding days
- Proposal status lifecycle: `draft → submitted → discussion → risk_insufficient → bear_review → voting → approved → rejected → watchlist → closed`
- Proposal list with status filters
- Proposal detail page (see sections below)

### Proposal Detail Page
1. Stock basic info
2. Proposer's investment thesis
3. Target price / stop-loss / exit condition
4. Bull points list (add, categorize)
5. Risk points list (add, categorize, severity)
6. Bear reviewer assignment
7. Scoring panel (5-dimension, 20 pts each)
8. Voting panel (agree / disagree / need_more_info / watch_later)
9. Consensus threshold check panel (shows what's missing)
10. Comment / discussion thread

### Consensus Threshold (default, configurable per group)
All 8 conditions must pass:
- Agree ratio ≥ 70%
- Average score ≥ 75 / 100
- Bull points ≥ 3
- Risk points ≥ 2
- Bear reviewer assigned
- Investment thesis filled
- Target price filled
- Stop-loss price OR exit condition filled

### Consensus List (`/groups/[groupId]/consensus`)
- Cards for each approved consensus stock
- Ticker, consensus date, consensus price, target price, stop-loss
- Group avg return %, follower count
- Status: `active / watching / closed / cancelled`

### Consensus Stock Detail
- All proposal info preserved (thesis, bull/risk points, scores, votes)
- Group avg return %, median return %, max/min return %
- Member follow-up table (who followed, their return %)

### Trade Records
- "Follow this stock" button → creates trade record
- Record buy date, buy price, quantity, invested amount
- Record sell date, sell price (when exiting)
- System calculates realized return %
- Current price (manual entry in MVP) → unrealized return %
- Batch buy support (trade_lots table) — can be deferred to Phase 5b

### Performance Dashboard (`/groups/[groupId]/performance`)
- Personal: return % per stock, overall avg, win rate
- Group per stock: avg return %, median return %
- Group total: avg return across all consensus stocks
- All figures in percentage — no absolute amounts shown publicly

### Rankings (`/groups/[groupId]/rankings`)
1. **Consensus Stock Return Ranking** — by group avg return % (min 2 followers or closed)
2. **Member Avg Return Ranking** — by member avg return % (min 3 stocks participated)
3. **Proposer Performance Ranking** — proposals submitted, approved, approval rate, avg return of approved stocks
4. **Risk Reviewer Accuracy** — risk hit rate (happened / total risk points)
5. **Most Stable Member** — positive avg return + minimum max single loss (MVP simplified version)

### Review (`/consensus/[consensusStockId]/review`)
- Was the original thesis valid?
- Was target price reached?
- Was stop-loss triggered?
- Which risks actually happened?
- What did we judge correctly?
- What did we judge incorrectly?
- Lessons learned
- What to improve next time

---

## Nice-to-Have (Post-MVP)

- Real-time stock price API (auto-update unrealized return)
- Push notifications for pending actions
- Annual return calculation
- Max drawdown
- Profit/loss ratio
- Risk reviewer accuracy leaderboard
- Batch buy/sell support (trade_lots fully implemented)
- Google OAuth login

---

## NOT in MVP

- Real-time stock price API
- Broker integration / auto trade import
- AI analysis features (planned for V2/V3)
- Public community / social feed
- Paid subscription
- Multi-currency conversion
- Full mobile app (iOS/Android) — MVP is mobile-responsive web
- Complex risk models
- High-frequency trade logging

---

## Success Metrics (MVP)

The MVP is successful when a group can complete the full loop:

1. User creates a group and invites friends
2. Member proposes a stock
3. Others add bull points and risk points
4. System warns if risk points are insufficient
5. Members score and vote
6. Stock passes consensus threshold and enters the consensus list
7. Members record whether they followed (and at what price)
8. System correctly calculates each member's % return
9. System calculates group average % return for the stock
10. After selling, records are preserved
11. Group completes a post-mortem review

---

## Role Permissions Summary

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| Create group | ✓ | — | — | — |
| Invite members | ✓ | ✓ | — | — |
| Modify group settings | ✓ | ✓ | — | — |
| Create proposal | ✓ | ✓ | ✓ | — |
| Add bull/risk points | ✓ | ✓ | ✓ | — |
| Score | ✓ | ✓ | ✓ | — |
| Vote | ✓ | ✓ | ✓ | — |
| Approve to consensus | ✓ | ✓ | Optional | — |
| Add trade record | ✓ | ✓ | ✓ | — |
| View performance | ✓ | ✓ | ✓ | ✓ |
| Edit others' trades | — | — | — | — |
| Delete group | ✓ | — | — | — |
