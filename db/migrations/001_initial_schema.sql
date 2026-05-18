-- 001_initial_schema.sql
-- Full database schema for 共同選股研究室 MVP
-- Run this in Supabase SQL Editor or via supabase db push

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. GROUPS
-- ============================================================
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id),
    consensus_agree_threshold NUMERIC DEFAULT 0.70,
    consensus_score_threshold NUMERIC DEFAULT 75,
    min_bull_points INT DEFAULT 3,
    min_risk_points INT DEFAULT 2,
    require_bear_reviewer BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. GROUP MEMBERS
-- ============================================================
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- ============================================================
-- 4. STOCK PROPOSALS
-- ============================================================
CREATE TABLE stock_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    proposer_id UUID REFERENCES users(id),
    ticker TEXT NOT NULL,
    stock_name TEXT NOT NULL,
    market TEXT,
    proposal_price NUMERIC,
    proposal_date DATE DEFAULT CURRENT_DATE,
    investment_thesis TEXT NOT NULL,
    target_price NUMERIC,
    stop_loss_price NUMERIC,
    exit_condition TEXT,
    expected_holding_days INT,
    status TEXT NOT NULL DEFAULT 'draft',
    bear_reviewer_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. PROPOSAL BULL POINTS
-- ============================================================
CREATE TABLE proposal_bull_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES stock_proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. PROPOSAL RISK POINTS
-- ============================================================
CREATE TABLE proposal_risk_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES stock_proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    category TEXT,
    severity TEXT DEFAULT 'medium',
    happened BOOLEAN DEFAULT FALSE,
    happened_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. PROPOSAL COMMENTS
-- ============================================================
CREATE TABLE proposal_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES stock_proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    comment_type TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. PROPOSAL SCORES
-- ============================================================
CREATE TABLE proposal_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES stock_proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    fundamental_score INT CHECK (fundamental_score BETWEEN 1 AND 20),
    industry_score INT CHECK (industry_score BETWEEN 1 AND 20),
    valuation_score INT CHECK (valuation_score BETWEEN 1 AND 20),
    risk_control_score INT CHECK (risk_control_score BETWEEN 1 AND 20),
    plan_score INT CHECK (plan_score BETWEEN 1 AND 20),
    total_score INT GENERATED ALWAYS AS (
        fundamental_score + industry_score + valuation_score + risk_control_score + plan_score
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

-- ============================================================
-- 9. PROPOSAL VOTES
-- ============================================================
CREATE TABLE proposal_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES stock_proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    vote TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

-- ============================================================
-- 10. CONSENSUS STOCKS
-- ============================================================
CREATE TABLE consensus_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES stock_proposals(id),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    stock_name TEXT NOT NULL,
    market TEXT,
    consensus_date DATE DEFAULT CURRENT_DATE,
    consensus_price NUMERIC,
    consensus_reason TEXT,
    consensus_target_price NUMERIC,
    consensus_stop_loss_price NUMERIC,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 11. TRADE RECORDS
-- ============================================================
CREATE TABLE trade_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consensus_stock_id UUID REFERENCES consensus_stocks(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    followed BOOLEAN DEFAULT TRUE,
    buy_date DATE,
    buy_price NUMERIC,
    quantity NUMERIC,
    invested_amount NUMERIC,
    sell_date DATE,
    sell_price NUMERIC,
    sell_quantity NUMERIC,
    realized_pnl NUMERIC,
    current_price NUMERIC,
    unrealized_return_pct NUMERIC,
    realized_return_pct NUMERIC,
    final_return_pct NUMERIC,
    holding_days INT,
    followed_original_plan BOOLEAN,
    note TEXT,
    status TEXT DEFAULT 'holding',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 12. TRADE LOTS (batch buy/sell support)
-- ============================================================
CREATE TABLE trade_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_record_id UUID REFERENCES trade_records(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    trade_date DATE NOT NULL,
    price NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    amount NUMERIC GENERATED ALWAYS AS (price * quantity) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 13. REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consensus_stock_id UUID REFERENCES consensus_stocks(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    thesis_valid BOOLEAN,
    target_reached BOOLEAN,
    stop_loss_triggered BOOLEAN,
    risks_happened TEXT,
    correct_judgements TEXT,
    wrong_judgements TEXT,
    lesson_learned TEXT,
    next_time_improvement TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_bull_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_risk_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consensus_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Users: can read own profile, update own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT WITH CHECK (id = auth.uid());

-- Groups: members can read their groups
CREATE POLICY "Members can view their groups"
ON groups FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Authenticated users can create groups"
ON groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner can update group"
ON groups FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete group"
ON groups FOR DELETE USING (owner_id = auth.uid());

-- Group Members: members of same group can see each other
CREATE POLICY "Members can view group members"
ON group_members FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Owner/Admin can add members"
ON group_members FOR INSERT WITH CHECK (
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR user_id = auth.uid()
);

CREATE POLICY "Owner/Admin can remove members"
ON group_members FOR DELETE USING (
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- Stock Proposals: group members can view
CREATE POLICY "Members can view group proposals"
ON stock_proposals FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Members can create proposals"
ON stock_proposals FOR INSERT WITH CHECK (
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
);

CREATE POLICY "Proposer can update own proposal"
ON stock_proposals FOR UPDATE USING (proposer_id = auth.uid());

-- Bull Points: group members can view and add
CREATE POLICY "Members can view bull points"
ON proposal_bull_points FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Members can add bull points"
ON proposal_bull_points FOR INSERT WITH CHECK (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    )
);

-- Risk Points: group members can view and add
CREATE POLICY "Members can view risk points"
ON proposal_risk_points FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Members can add risk points"
ON proposal_risk_points FOR INSERT WITH CHECK (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    )
);

CREATE POLICY "Author can update risk points"
ON proposal_risk_points FOR UPDATE USING (user_id = auth.uid());

-- Comments: group members can view and add
CREATE POLICY "Members can view comments"
ON proposal_comments FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Members can add comments"
ON proposal_comments FOR INSERT WITH CHECK (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    )
);

-- Scores: group members can view and submit own
CREATE POLICY "Members can view scores"
ON proposal_scores FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Members can submit own score"
ON proposal_scores FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update own score"
ON proposal_scores FOR UPDATE USING (user_id = auth.uid());

-- Votes: group members can view and submit own
CREATE POLICY "Members can view votes"
ON proposal_votes FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Members can submit own vote"
ON proposal_votes FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update own vote"
ON proposal_votes FOR UPDATE USING (user_id = auth.uid());

-- Consensus Stocks: group members can view
CREATE POLICY "Members can view consensus stocks"
ON consensus_stocks FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Owner/Admin can create consensus stocks"
ON consensus_stocks FOR INSERT WITH CHECK (
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Owner/Admin can update consensus stocks"
ON consensus_stocks FOR UPDATE USING (
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- Trade Records: members can view group trades, manage own
CREATE POLICY "Members can view group trade records"
ON trade_records FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Members can insert own trade records"
ON trade_records FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update own trade records"
ON trade_records FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Members can delete own trade records"
ON trade_records FOR DELETE USING (user_id = auth.uid());

-- Trade Lots: same as trade records
CREATE POLICY "Members can view trade lots"
ON trade_lots FOR SELECT USING (
    trade_record_id IN (
        SELECT id FROM trade_records WHERE group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Owner of trade can add lots"
ON trade_lots FOR INSERT WITH CHECK (
    trade_record_id IN (
        SELECT id FROM trade_records WHERE user_id = auth.uid()
    )
);

-- Reviews: group members can view and create
CREATE POLICY "Members can view reviews"
ON reviews FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);

CREATE POLICY "Members can create reviews"
ON reviews FOR INSERT WITH CHECK (
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
);

CREATE POLICY "Author can update review"
ON reviews FOR UPDATE USING (created_by = auth.uid());

-- ============================================================
-- HELPER: Auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- HELPER: Updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON stock_proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON proposal_risk_points FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON proposal_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON proposal_votes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON consensus_stocks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON trade_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
