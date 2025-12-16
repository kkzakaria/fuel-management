-- Migration: Fix km_fin nullable
-- Description: Permet la création de trajets sans km_fin (rempli au retour)
--
-- Le champ km_fin doit être nullable car il est renseigné uniquement
-- lors de l'enregistrement du retour du trajet, pas à la création.

ALTER TABLE trajet ALTER COLUMN km_fin DROP NOT NULL;

-- Ajouter un commentaire pour documenter l'usage
COMMENT ON COLUMN trajet.km_fin IS 'Kilométrage de retour - renseigné lors de l''enregistrement du retour du trajet';
