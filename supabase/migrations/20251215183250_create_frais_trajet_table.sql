-- Migration: Créer la table frais_trajet pour supporter les frais multiples
-- Cette table permet de stocker plusieurs frais avec libellé et montant pour chaque trajet

-- Créer la table frais_trajet
CREATE TABLE IF NOT EXISTS frais_trajet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trajet_id UUID NOT NULL REFERENCES trajet(id) ON DELETE CASCADE,
    libelle VARCHAR(100) NOT NULL,
    montant NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (montant >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes par trajet
CREATE INDEX IF NOT EXISTS idx_frais_trajet_trajet_id ON frais_trajet(trajet_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_frais_trajet_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_frais_trajet_updated_at
    BEFORE UPDATE ON frais_trajet
    FOR EACH ROW
    EXECUTE FUNCTION update_frais_trajet_updated_at();

-- RLS Policies
ALTER TABLE frais_trajet ENABLE ROW LEVEL SECURITY;

-- Policy: Les admins ont accès complet
CREATE POLICY "frais_trajet_admin_all" ON frais_trajet
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'admin'
        )
    );

-- Policy: Les gestionnaires peuvent lire et écrire
CREATE POLICY "frais_trajet_gestionnaire_all" ON frais_trajet
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'gestionnaire'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'gestionnaire'
        )
    );

-- Policy: Les chauffeurs peuvent voir et créer des frais pour leurs propres trajets
CREATE POLICY "frais_trajet_chauffeur_own" ON frais_trajet
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM trajet t
            JOIN profiles p ON p.chauffeur_id = t.chauffeur_id
            WHERE t.id = frais_trajet.trajet_id
            AND p.id = (SELECT auth.uid())
            AND p.role = 'chauffeur'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trajet t
            JOIN profiles p ON p.chauffeur_id = t.chauffeur_id
            WHERE t.id = frais_trajet.trajet_id
            AND p.id = (SELECT auth.uid())
            AND p.role = 'chauffeur'
        )
    );

-- Policy: Le personnel peut lire
CREATE POLICY "frais_trajet_personnel_read" ON frais_trajet
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'personnel'
        )
    );

-- Commentaire sur la table
COMMENT ON TABLE frais_trajet IS 'Table des frais additionnels par trajet (péage, manutention, stationnement, etc.)';
COMMENT ON COLUMN frais_trajet.libelle IS 'Description du frais (ex: Péage, Manutention, Stationnement)';
COMMENT ON COLUMN frais_trajet.montant IS 'Montant du frais en XOF';
