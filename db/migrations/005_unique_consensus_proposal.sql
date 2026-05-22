-- Remove duplicate consensus_stocks records, keeping the earliest per proposal.
-- Then enforce uniqueness to prevent future duplicates.

DELETE FROM consensus_stocks
WHERE id NOT IN (
  SELECT DISTINCT ON (proposal_id) id
  FROM consensus_stocks
  ORDER BY proposal_id, created_at ASC
);

ALTER TABLE consensus_stocks
ADD CONSTRAINT unique_consensus_proposal UNIQUE (proposal_id);
