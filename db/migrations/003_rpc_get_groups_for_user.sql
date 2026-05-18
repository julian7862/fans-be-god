-- 003_rpc_get_groups_for_user.sql
-- Single query RPC to get user's groups with member count

CREATE OR REPLACE FUNCTION public.get_groups_for_user(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  owner_id UUID,
  consensus_agree_threshold NUMERIC,
  consensus_score_threshold NUMERIC,
  min_bull_points INT,
  min_risk_points INT,
  require_bear_reviewer BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  member_count BIGINT
) AS $$
  SELECT
    g.id,
    g.name,
    g.description,
    g.owner_id,
    g.consensus_agree_threshold,
    g.consensus_score_threshold,
    g.min_bull_points,
    g.min_risk_points,
    g.require_bear_reviewer,
    g.created_at,
    g.updated_at,
    (SELECT count(*) FROM group_members gm2 WHERE gm2.group_id = g.id) AS member_count
  FROM groups g
  INNER JOIN group_members gm ON gm.group_id = g.id
  WHERE gm.user_id = p_user_id
  ORDER BY g.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
