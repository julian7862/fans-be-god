-- Add close-related fields to consensus_stocks for the manual close flow.
-- admin/owner fills exit_price and close_reason when closing a consensus stock.

ALTER TABLE consensus_stocks
  ADD COLUMN exit_price NUMERIC,
  ADD COLUMN close_reason TEXT,
  ADD COLUMN closed_at TIMESTAMP WITH TIME ZONE;
