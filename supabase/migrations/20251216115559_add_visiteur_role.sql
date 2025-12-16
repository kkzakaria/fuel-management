-- Migration: add_visiteur_role
-- Description: Ajoute le rôle "visiteur" à l'enum user_role
-- Author: Claude Code
-- Date: 2025-12-16

-- Ajouter la valeur 'visiteur' à l'enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'visiteur';

-- Commentaire sur le nouveau rôle
COMMENT ON TYPE user_role IS 'Rôles utilisateurs: admin (accès complet), gestionnaire (gestion flotte), chauffeur (lecture seule ses trajets), personnel (création trajets et retours), visiteur (lecture seule)';
