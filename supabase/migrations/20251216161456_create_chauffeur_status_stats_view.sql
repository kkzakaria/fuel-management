-- Migration: Create chauffeur_status_stats view
-- Description: Aggregated view for chauffeur status statistics (dashboard)
-- This replaces client-side counting with efficient database-level aggregation

CREATE OR REPLACE VIEW chauffeur_status_stats AS
SELECT
  statut,
  COUNT(*)::int as count,
  ROUND(
    COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0),
    1
  )::numeric as percentage
FROM chauffeur
GROUP BY statut
ORDER BY count DESC;

-- Grant access to authenticated users (inherits RLS from chauffeur table)
GRANT SELECT ON chauffeur_status_stats TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW chauffeur_status_stats IS
  'Aggregated statistics of chauffeurs by status for dashboard display. Returns count and percentage per status.';
