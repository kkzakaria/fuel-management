-- Migration: Ajouter les statuts "en_voyage" et "en_conge" pour les chauffeurs
-- Description: Étend les options de statut pour mieux refléter la disponibilité des chauffeurs

-- Supprimer l'ancienne contrainte CHECK
ALTER TABLE public.CHAUFFEUR DROP CONSTRAINT IF EXISTS chauffeur_statut_check;

-- Ajouter la nouvelle contrainte CHECK avec les nouveaux statuts
ALTER TABLE public.CHAUFFEUR ADD CONSTRAINT chauffeur_statut_check
  CHECK (statut IN ('actif', 'inactif', 'suspendu', 'en_voyage', 'en_conge'));

-- Commentaire sur les statuts
COMMENT ON COLUMN public.CHAUFFEUR.statut IS 'Statut du chauffeur: actif (disponible), inactif (plus en activité), suspendu (temporairement indisponible), en_voyage (en mission), en_conge (en congé)';
