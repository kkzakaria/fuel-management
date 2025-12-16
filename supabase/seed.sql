-- =============================================================================
-- SEED FILE - Chauffeur Status Distribution for Dashboard Testing
-- =============================================================================
-- This file is executed after migrations during `supabase db reset`
-- For test users, run: pnpm tsx scripts/seed-users.ts
-- =============================================================================

-- Update existing chauffeurs with varied statuses for dashboard testing
UPDATE public.chauffeur SET statut = 'actif' WHERE nom IN ('Kouassi', 'Coulibaly', 'Touré');
UPDATE public.chauffeur SET statut = 'en_voyage' WHERE nom IN ('Koné', 'Bamba');
UPDATE public.chauffeur SET statut = 'en_conge' WHERE nom = 'Sangaré';
UPDATE public.chauffeur SET statut = 'suspendu' WHERE nom = 'Diallo';
UPDATE public.chauffeur SET statut = 'inactif' WHERE nom = 'N''Guessan';

-- Add extra chauffeurs for better status distribution
INSERT INTO public.chauffeur (nom, prenom, telephone, numero_permis, date_embauche, statut) VALUES
  ('Traoré', 'Oumar', '+225 07 11 22 33 44', 'CI-AB-111111', '2022-02-01', 'actif'),
  ('Soro', 'Abdoulaye', '+225 05 22 33 44 55', 'CI-AB-222222', '2021-08-15', 'actif'),
  ('Yao', 'Koffi', '+225 01 33 44 55 66', 'CI-AB-333333', '2020-05-20', 'en_voyage'),
  ('Aka', 'Bernard', '+225 07 44 55 66 77', 'CI-AB-444444', '2019-12-10', 'en_voyage'),
  ('Gnagne', 'Patrick', '+225 05 55 66 77 88', 'CI-AB-555555', '2021-03-25', 'en_conge'),
  ('Mensah', 'Kofi', '+225 01 66 77 88 99', 'CI-AB-666666', '2018-07-01', 'suspendu')
ON CONFLICT (numero_permis) DO UPDATE SET statut = EXCLUDED.statut;

-- =============================================================================
-- CHAUFFEUR STATUS DISTRIBUTION (for dashboard testing)
-- =============================================================================
--
-- | Statut     | Count | Chauffeurs                                    |
-- |------------|-------|-----------------------------------------------|
-- | actif      | 5     | Kouassi, Coulibaly, Touré, Traoré, Soro       |
-- | en_voyage  | 4     | Koné, Bamba, Yao, Aka                         |
-- | en_conge   | 2     | Sangaré, Gnagne                               |
-- | suspendu   | 2     | Diallo, Mensah                                |
-- | inactif    | 1     | N'Guessan                                     |
-- | TOTAL      | 14    |                                               |
--
-- =============================================================================
-- TEST USERS - Run after db reset:
-- =============================================================================
--
--   pnpm tsx scripts/seed-users.ts
--
-- | Email                        | Password  | Role         |
-- |------------------------------|-----------|--------------|
-- | admin@transport.ci           | Test123!  | admin        |
-- | gestionnaire@transport.ci    | Test123!  | gestionnaire |
-- | chauffeur1@transport.ci      | Test123!  | chauffeur    |
-- | chauffeur2@transport.ci      | Test123!  | chauffeur    |
-- | personnel@transport.ci       | Test123!  | personnel    |
-- | visiteur@transport.ci        | Test123!  | visiteur     |
--
-- =============================================================================
