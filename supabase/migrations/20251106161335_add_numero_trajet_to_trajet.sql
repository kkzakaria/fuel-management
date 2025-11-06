-- Migration: Add Human-Readable Trip Number (numero_trajet)
-- Description: Add auto-generated sequential trip number in format TRJ-YYYY-NNNN
-- Format: TRJ-2025-0001 (year only, 4-digit counter)
-- Priority: Enhancement - User identification improvement
-- Reference: https://www.postgresql.org/docs/current/sql-createsequence.html

-- 1. Create sequence for trip numbers
-- Reset annually, starts at 1 each year
CREATE SEQUENCE IF NOT EXISTS trajet_numero_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 1;

-- 2. Create function to generate trip number (TRJ-YYYY-NNNN)
CREATE OR REPLACE FUNCTION generate_numero_trajet()
RETURNS TRIGGER AS $$
DECLARE
  current_year TEXT;
  next_numero INTEGER;
  new_numero_trajet TEXT;
BEGIN
  -- Get current year
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Get next sequence number for this year
  -- Find max numero for current year and increment
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(numero_trajet FROM 'TRJ-\d{4}-(\d{4})') AS INTEGER)
  ), 0) + 1
  INTO next_numero
  FROM trajet
  WHERE numero_trajet LIKE 'TRJ-' || current_year || '-%';

  -- Generate numero in format TRJ-YYYY-NNNN
  new_numero_trajet := 'TRJ-' || current_year || '-' || LPAD(next_numero::TEXT, 4, '0');

  -- Assign to NEW record
  NEW.numero_trajet := new_numero_trajet;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

-- 3. Add column to trajet table (nullable initially for backfill)
ALTER TABLE public.trajet
  ADD COLUMN numero_trajet VARCHAR(20) UNIQUE;

-- 4. Backfill existing trajets with sequential numbers
-- Generate numbers for existing records based on creation order
DO $$
DECLARE
  trajet_record RECORD;
  year_text TEXT;
  counter INTEGER;
  current_year TEXT := NULL;
BEGIN
  counter := 1;

  -- Loop through existing trajets ordered by created_at
  FOR trajet_record IN
    SELECT id, created_at
    FROM trajet
    ORDER BY created_at ASC
  LOOP
    -- Extract year from created_at
    year_text := TO_CHAR(trajet_record.created_at, 'YYYY');

    -- Reset counter if year changes
    IF current_year IS NULL OR current_year != year_text THEN
      current_year := year_text;
      counter := 1;
    END IF;

    -- Update record with generated numero
    UPDATE trajet
    SET numero_trajet = 'TRJ-' || year_text || '-' || LPAD(counter::TEXT, 4, '0')
    WHERE id = trajet_record.id;

    counter := counter + 1;
  END LOOP;
END $$;

-- 5. Make column NOT NULL after backfill
ALTER TABLE public.trajet
  ALTER COLUMN numero_trajet SET NOT NULL;

-- 6. Create trigger for automatic numero generation on INSERT
DROP TRIGGER IF EXISTS set_numero_trajet_trigger ON public.trajet;

CREATE TRIGGER set_numero_trajet_trigger
  BEFORE INSERT ON public.trajet
  FOR EACH ROW
  EXECUTE FUNCTION generate_numero_trajet();

-- 7. Create index for search performance
CREATE INDEX IF NOT EXISTS idx_trajet_numero_trajet
  ON public.trajet(numero_trajet);

-- 8. Add comments for documentation
COMMENT ON COLUMN public.trajet.numero_trajet IS
  'Human-readable trip number in format TRJ-YYYY-NNNN (e.g., TRJ-2025-0001). Auto-generated sequentially per year.';

COMMENT ON FUNCTION generate_numero_trajet() IS
  'Trigger function to auto-generate trip number in format TRJ-YYYY-NNNN. Counter resets annually. Search path secured against SQL injection.';

COMMENT ON INDEX idx_trajet_numero_trajet IS
  'Index on numero_trajet for fast search and filtering by trip number.';
