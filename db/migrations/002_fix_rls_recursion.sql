-- 002_fix_rls_recursion.sql
-- Fix infinite recursion in group_members RLS policies
-- The issue: group_members SELECT policy queries group_members itself

-- Step 1: Create a SECURITY DEFINER function that bypasses RLS
-- This allows policies to check membership without triggering recursion
CREATE OR REPLACE FUNCTION public.is_member_of_group(check_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = check_group_id
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_group_ids()
RETURNS SETOF UUID AS $$
  SELECT group_id FROM public.group_members
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role_in_group(check_group_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.group_members
  WHERE group_id = check_group_id
  AND user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 2: Drop the recursive policies
DROP POLICY IF EXISTS "Members can view their groups" ON groups;
DROP POLICY IF EXISTS "Members can view group members" ON group_members;
DROP POLICY IF EXISTS "Owner/Admin can add members" ON group_members;
DROP POLICY IF EXISTS "Owner/Admin can remove members" ON group_members;
DROP POLICY IF EXISTS "Members can view group proposals" ON stock_proposals;
DROP POLICY IF EXISTS "Members can create proposals" ON stock_proposals;
DROP POLICY IF EXISTS "Members can view bull points" ON proposal_bull_points;
DROP POLICY IF EXISTS "Members can add bull points" ON proposal_bull_points;
DROP POLICY IF EXISTS "Members can view risk points" ON proposal_risk_points;
DROP POLICY IF EXISTS "Members can add risk points" ON proposal_risk_points;
DROP POLICY IF EXISTS "Members can view comments" ON proposal_comments;
DROP POLICY IF EXISTS "Members can add comments" ON proposal_comments;
DROP POLICY IF EXISTS "Members can view scores" ON proposal_scores;
DROP POLICY IF EXISTS "Members can view votes" ON proposal_votes;
DROP POLICY IF EXISTS "Members can view consensus stocks" ON consensus_stocks;
DROP POLICY IF EXISTS "Owner/Admin can create consensus stocks" ON consensus_stocks;
DROP POLICY IF EXISTS "Owner/Admin can update consensus stocks" ON consensus_stocks;
DROP POLICY IF EXISTS "Members can view group trade records" ON trade_records;
DROP POLICY IF EXISTS "Members can view trade lots" ON trade_lots;
DROP POLICY IF EXISTS "Members can view reviews" ON reviews;
DROP POLICY IF EXISTS "Members can create reviews" ON reviews;

-- Step 3: Recreate policies using the SECURITY DEFINER functions

-- GROUPS: use function to check membership
CREATE POLICY "Members can view their groups"
ON groups FOR SELECT USING (
    id IN (SELECT public.get_user_group_ids())
);

-- GROUP MEMBERS: use direct user_id check (no self-reference)
CREATE POLICY "Members can view group members"
ON group_members FOR SELECT USING (
    public.is_member_of_group(group_id)
);

CREATE POLICY "Owner/Admin can add members"
ON group_members FOR INSERT WITH CHECK (
    public.get_user_role_in_group(group_id) IN ('owner', 'admin')
    OR user_id = auth.uid()
);

CREATE POLICY "Owner/Admin can remove members"
ON group_members FOR DELETE USING (
    public.get_user_role_in_group(group_id) IN ('owner', 'admin')
);

-- STOCK PROPOSALS
CREATE POLICY "Members can view group proposals"
ON stock_proposals FOR SELECT USING (
    public.is_member_of_group(group_id)
);

CREATE POLICY "Members can create proposals"
ON stock_proposals FOR INSERT WITH CHECK (
    public.get_user_role_in_group(group_id) IN ('owner', 'admin', 'member')
);

-- BULL POINTS
CREATE POLICY "Members can view bull points"
ON proposal_bull_points FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE public.is_member_of_group(group_id)
    )
);

CREATE POLICY "Members can add bull points"
ON proposal_bull_points FOR INSERT WITH CHECK (
    proposal_id IN (
        SELECT id FROM stock_proposals
        WHERE public.get_user_role_in_group(group_id) IN ('owner', 'admin', 'member')
    )
);

-- RISK POINTS
CREATE POLICY "Members can view risk points"
ON proposal_risk_points FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE public.is_member_of_group(group_id)
    )
);

CREATE POLICY "Members can add risk points"
ON proposal_risk_points FOR INSERT WITH CHECK (
    proposal_id IN (
        SELECT id FROM stock_proposals
        WHERE public.get_user_role_in_group(group_id) IN ('owner', 'admin', 'member')
    )
);

-- COMMENTS
CREATE POLICY "Members can view comments"
ON proposal_comments FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE public.is_member_of_group(group_id)
    )
);

CREATE POLICY "Members can add comments"
ON proposal_comments FOR INSERT WITH CHECK (
    proposal_id IN (
        SELECT id FROM stock_proposals
        WHERE public.get_user_role_in_group(group_id) IN ('owner', 'admin', 'member')
    )
);

-- SCORES
CREATE POLICY "Members can view scores"
ON proposal_scores FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE public.is_member_of_group(group_id)
    )
);

-- VOTES
CREATE POLICY "Members can view votes"
ON proposal_votes FOR SELECT USING (
    proposal_id IN (
        SELECT id FROM stock_proposals WHERE public.is_member_of_group(group_id)
    )
);

-- CONSENSUS STOCKS
CREATE POLICY "Members can view consensus stocks"
ON consensus_stocks FOR SELECT USING (
    public.is_member_of_group(group_id)
);

CREATE POLICY "Owner/Admin can create consensus stocks"
ON consensus_stocks FOR INSERT WITH CHECK (
    public.get_user_role_in_group(group_id) IN ('owner', 'admin')
);

CREATE POLICY "Owner/Admin can update consensus stocks"
ON consensus_stocks FOR UPDATE USING (
    public.get_user_role_in_group(group_id) IN ('owner', 'admin')
);

-- TRADE RECORDS
CREATE POLICY "Members can view group trade records"
ON trade_records FOR SELECT USING (
    public.is_member_of_group(group_id)
);

-- TRADE LOTS
CREATE POLICY "Members can view trade lots"
ON trade_lots FOR SELECT USING (
    trade_record_id IN (
        SELECT id FROM trade_records WHERE public.is_member_of_group(group_id)
    )
);

-- REVIEWS
CREATE POLICY "Members can view reviews"
ON reviews FOR SELECT USING (
    public.is_member_of_group(group_id)
);

CREATE POLICY "Members can create reviews"
ON reviews FOR INSERT WITH CHECK (
    public.get_user_role_in_group(group_id) IN ('owner', 'admin', 'member')
);
