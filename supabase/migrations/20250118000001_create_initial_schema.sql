-- Migration: create_initial_schema
-- Description: Creates the 8 main tables for Transport Manager application
-- Author: Claude Code
-- Date: 2025-10-18

-- =====================================================
-- 1. LOCALITE - Cities and regions (Côte d'Ivoire)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.LOCALITE (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL UNIQUE,
  region VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_localite_nom ON public.LOCALITE(nom);
CREATE INDEX idx_localite_region ON public.LOCALITE(region);

-- =====================================================
-- 2. TYPE_CONTENEUR - Container types (20'/40'/45')
-- =====================================================
CREATE TABLE IF NOT EXISTS public.TYPE_CONTENEUR (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(50) NOT NULL UNIQUE,
  taille_pieds INTEGER NOT NULL CHECK (taille_pieds IN (20, 40, 45)),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_type_conteneur_taille ON public.TYPE_CONTENEUR(taille_pieds);

-- =====================================================
-- 3. CHAUFFEUR - Driver profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.CHAUFFEUR (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  numero_permis VARCHAR(50) UNIQUE,
  date_embauche DATE,
  statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chauffeur_nom ON public.CHAUFFEUR(nom, prenom);
CREATE INDEX idx_chauffeur_statut ON public.CHAUFFEUR(statut);
CREATE INDEX idx_chauffeur_permis ON public.CHAUFFEUR(numero_permis);

-- =====================================================
-- 4. VEHICULE - Fleet vehicles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.VEHICULE (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  immatriculation VARCHAR(50) NOT NULL UNIQUE,
  marque VARCHAR(100),
  modele VARCHAR(100),
  annee INTEGER CHECK (annee >= 1900 AND annee <= 2100),
  type_carburant VARCHAR(20) DEFAULT 'gasoil' CHECK (type_carburant IN ('gasoil', 'essence', 'hybride', 'electrique')),
  kilometrage_actuel INTEGER DEFAULT 0 CHECK (kilometrage_actuel >= 0),
  statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'maintenance', 'inactif', 'vendu')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicule_immatriculation ON public.VEHICULE(immatriculation);
CREATE INDEX idx_vehicule_statut ON public.VEHICULE(statut);

-- =====================================================
-- 5. SOUS_TRAITANT - Subcontractors
-- =====================================================
CREATE TABLE IF NOT EXISTS public.SOUS_TRAITANT (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_entreprise VARCHAR(200) NOT NULL,
  contact_principal VARCHAR(100),
  telephone VARCHAR(20),
  email VARCHAR(100),
  adresse TEXT,
  statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'blackliste')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sous_traitant_nom ON public.SOUS_TRAITANT(nom_entreprise);
CREATE INDEX idx_sous_traitant_statut ON public.SOUS_TRAITANT(statut);

-- =====================================================
-- 6. TRAJET - Trip records with auto-calculated fields
-- =====================================================
CREATE TABLE IF NOT EXISTS public.TRAJET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_trajet DATE NOT NULL DEFAULT CURRENT_DATE,
  chauffeur_id UUID NOT NULL REFERENCES public.CHAUFFEUR(id) ON DELETE RESTRICT,
  vehicule_id UUID NOT NULL REFERENCES public.VEHICULE(id) ON DELETE RESTRICT,
  localite_depart_id UUID NOT NULL REFERENCES public.LOCALITE(id) ON DELETE RESTRICT,
  localite_arrivee_id UUID NOT NULL REFERENCES public.LOCALITE(id) ON DELETE RESTRICT,

  -- Kilometrage
  km_debut INTEGER NOT NULL CHECK (km_debut >= 0),
  km_fin INTEGER NOT NULL CHECK (km_fin >= km_debut),
  parcours_total INTEGER GENERATED ALWAYS AS (km_fin - km_debut) STORED,

  -- Fuel data
  litrage_prevu DECIMAL(10, 2) CHECK (litrage_prevu >= 0),
  litrage_station DECIMAL(10, 2) CHECK (litrage_station >= 0),
  ecart_litrage DECIMAL(10, 2) GENERATED ALWAYS AS (litrage_prevu - litrage_station) STORED,
  prix_litre DECIMAL(10, 2) CHECK (prix_litre >= 0),

  -- Calculated consumption metrics
  consommation_au_100 DECIMAL(10, 2) GENERATED ALWAYS AS (
    CASE
      WHEN (km_fin - km_debut) > 0 THEN (litrage_station * 100.0) / (km_fin - km_debut)
      ELSE 0
    END
  ) STORED,
  prix_litre_calcule DECIMAL(10, 2) GENERATED ALWAYS AS (
    CASE
      WHEN litrage_station > 0 THEN prix_litre / litrage_station
      ELSE 0
    END
  ) STORED,

  -- Costs
  frais_peage DECIMAL(10, 2) DEFAULT 0 CHECK (frais_peage >= 0),
  autres_frais DECIMAL(10, 2) DEFAULT 0 CHECK (autres_frais >= 0),

  -- Status and notes
  statut VARCHAR(20) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'annule')),
  observations TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trajet_date ON public.TRAJET(date_trajet DESC);
CREATE INDEX idx_trajet_chauffeur ON public.TRAJET(chauffeur_id);
CREATE INDEX idx_trajet_vehicule ON public.TRAJET(vehicule_id);
CREATE INDEX idx_trajet_localite_depart ON public.TRAJET(localite_depart_id);
CREATE INDEX idx_trajet_localite_arrivee ON public.TRAJET(localite_arrivee_id);
CREATE INDEX idx_trajet_statut ON public.TRAJET(statut);

-- =====================================================
-- 7. CONTENEUR_TRAJET - Trip-container junction table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.CONTENEUR_TRAJET (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trajet_id UUID NOT NULL REFERENCES public.TRAJET(id) ON DELETE CASCADE,
  type_conteneur_id UUID NOT NULL REFERENCES public.TYPE_CONTENEUR(id) ON DELETE RESTRICT,
  numero_conteneur VARCHAR(50),
  quantite INTEGER DEFAULT 1 CHECK (quantite > 0),
  statut_livraison VARCHAR(20) DEFAULT 'en_cours' CHECK (statut_livraison IN ('en_cours', 'livre', 'retour')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(trajet_id, numero_conteneur)
);

CREATE INDEX idx_conteneur_trajet_trajet ON public.CONTENEUR_TRAJET(trajet_id);
CREATE INDEX idx_conteneur_trajet_type ON public.CONTENEUR_TRAJET(type_conteneur_id);
CREATE INDEX idx_conteneur_trajet_numero ON public.CONTENEUR_TRAJET(numero_conteneur);

-- =====================================================
-- 8. MISSION_SOUS_TRAITANCE - Subcontractor missions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.MISSION_SOUS_TRAITANCE (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sous_traitant_id UUID NOT NULL REFERENCES public.SOUS_TRAITANT(id) ON DELETE RESTRICT,
  date_mission DATE NOT NULL DEFAULT CURRENT_DATE,
  localite_depart_id UUID NOT NULL REFERENCES public.LOCALITE(id) ON DELETE RESTRICT,
  localite_arrivee_id UUID NOT NULL REFERENCES public.LOCALITE(id) ON DELETE RESTRICT,

  -- Container info
  type_conteneur_id UUID NOT NULL REFERENCES public.TYPE_CONTENEUR(id) ON DELETE RESTRICT,
  numero_conteneur VARCHAR(50),
  quantite INTEGER DEFAULT 1 CHECK (quantite > 0),

  -- Payment structure (90% + 10%)
  montant_total DECIMAL(10, 2) NOT NULL CHECK (montant_total >= 0),
  montant_90_pourcent DECIMAL(10, 2) GENERATED ALWAYS AS (montant_total * 0.9) STORED,
  reste_10_pourcent DECIMAL(10, 2) GENERATED ALWAYS AS (montant_total * 0.1) STORED,

  -- Payment status
  avance_payee BOOLEAN DEFAULT FALSE,
  solde_paye BOOLEAN DEFAULT FALSE,
  date_paiement_avance DATE,
  date_paiement_solde DATE,

  -- Status and notes
  statut VARCHAR(20) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'terminee', 'annulee')),
  observations TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mission_st_date ON public.MISSION_SOUS_TRAITANCE(date_mission DESC);
CREATE INDEX idx_mission_st_sous_traitant ON public.MISSION_SOUS_TRAITANCE(sous_traitant_id);
CREATE INDEX idx_mission_st_localite_depart ON public.MISSION_SOUS_TRAITANCE(localite_depart_id);
CREATE INDEX idx_mission_st_localite_arrivee ON public.MISSION_SOUS_TRAITANCE(localite_arrivee_id);
CREATE INDEX idx_mission_st_statut ON public.MISSION_SOUS_TRAITANCE(statut);
CREATE INDEX idx_mission_st_paiement ON public.MISSION_SOUS_TRAITANCE(avance_payee, solde_paye);

-- =====================================================
-- TRIGGERS - Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_localite_updated_at BEFORE UPDATE ON public.LOCALITE
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_type_conteneur_updated_at BEFORE UPDATE ON public.TYPE_CONTENEUR
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chauffeur_updated_at BEFORE UPDATE ON public.CHAUFFEUR
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicule_updated_at BEFORE UPDATE ON public.VEHICULE
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sous_traitant_updated_at BEFORE UPDATE ON public.SOUS_TRAITANT
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trajet_updated_at BEFORE UPDATE ON public.TRAJET
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conteneur_trajet_updated_at BEFORE UPDATE ON public.CONTENEUR_TRAJET
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mission_st_updated_at BEFORE UPDATE ON public.MISSION_SOUS_TRAITANCE
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS - Table and column documentation
-- =====================================================
COMMENT ON TABLE public.LOCALITE IS 'Cities and regions in Côte d''Ivoire';
COMMENT ON TABLE public.TYPE_CONTENEUR IS 'Container types: 20 feet, 40 feet, 45 feet';
COMMENT ON TABLE public.CHAUFFEUR IS 'Driver profiles with employment status';
COMMENT ON TABLE public.VEHICULE IS 'Fleet vehicles with fuel type and mileage tracking';
COMMENT ON TABLE public.SOUS_TRAITANT IS 'Subcontractor companies';
COMMENT ON TABLE public.TRAJET IS 'Trip records with automatic fuel consumption calculations';
COMMENT ON TABLE public.CONTENEUR_TRAJET IS 'Junction table linking containers to trips';
COMMENT ON TABLE public.MISSION_SOUS_TRAITANCE IS 'Subcontractor missions with 90/10 payment structure';

COMMENT ON COLUMN public.TRAJET.ecart_litrage IS 'Fuel variance: expected - actual (alerts when >10L)';
COMMENT ON COLUMN public.TRAJET.consommation_au_100 IS 'Fuel consumption per 100km (L/100km)';
COMMENT ON COLUMN public.MISSION_SOUS_TRAITANCE.montant_90_pourcent IS 'Advance payment (90% of total)';
COMMENT ON COLUMN public.MISSION_SOUS_TRAITANCE.reste_10_pourcent IS 'Balance payment (10% of total)';
