-- Migration: seed_data
-- Description: Seed data for Côte d'Ivoire locations, container types, and test users
-- Author: Claude Code
-- Date: 2025-10-18

-- =====================================================
-- SEED DATA - LOCALITE (Côte d'Ivoire cities)
-- =====================================================
INSERT INTO public.LOCALITE (nom, region) VALUES
  -- District d'Abidjan
  ('Abidjan - Port', 'District d''Abidjan'),
  ('Abidjan - Plateau', 'District d''Abidjan'),
  ('Abidjan - Yopougon', 'District d''Abidjan'),
  ('Abidjan - Cocody', 'District d''Abidjan'),
  ('Abidjan - Adjamé', 'District d''Abidjan'),
  ('Abidjan - Koumassi', 'District d''Abidjan'),
  ('Abidjan - Treichville', 'District d''Abidjan'),
  ('Abidjan - Marcory', 'District d''Abidjan'),
  ('Abidjan - Abobo', 'District d''Abidjan'),
  ('Abidjan - Anyama', 'District d''Abidjan'),
  ('Abidjan - Bingerville', 'District d''Abidjan'),

  -- District de Yamoussoukro
  ('Yamoussoukro', 'District de Yamoussoukro'),

  -- District des Lagunes
  ('Dabou', 'District des Lagunes'),
  ('Grand-Lahou', 'District des Lagunes'),
  ('Jacqueville', 'District des Lagunes'),
  ('Tiassalé', 'District des Lagunes'),
  ('Adzopé', 'District des Lagunes'),
  ('Agboville', 'District des Lagunes'),
  ('Alépé', 'District des Lagunes'),
  ('Sikensi', 'District des Lagunes'),

  -- District de la Comoé
  ('Abengourou', 'District de la Comoé'),
  ('Agnibilékrou', 'District de la Comoé'),
  ('Bettié', 'District de la Comoé'),

  -- District du Gôh-Djiboua
  ('Gagnoa', 'District du Gôh-Djiboua'),
  ('Divo', 'District du Gôh-Djiboua'),
  ('Lakota', 'District du Gôh-Djiboua'),
  ('Guitry', 'District du Gôh-Djiboua'),

  -- District des Montagnes
  ('Man', 'District des Montagnes'),
  ('Danané', 'District des Montagnes'),
  ('Touba', 'District des Montagnes'),
  ('Biankouma', 'District des Montagnes'),

  -- District du Sassandra-Marahoué
  ('Daloa', 'District du Sassandra-Marahoué'),
  ('Bouaflé', 'District du Sassandra-Marahoué'),
  ('Vavoua', 'District du Sassandra-Marahoué'),
  ('Issia', 'District du Sassandra-Marahoué'),
  ('San-Pédro', 'District du Sassandra-Marahoué'),
  ('Soubré', 'District du Sassandra-Marahoué'),
  ('Sassandra', 'District du Sassandra-Marahoué'),

  -- District des Savanes
  ('Korhogo', 'District des Savanes'),
  ('Boundiali', 'District des Savanes'),
  ('Ferkessédougou', 'District des Savanes'),
  ('Odienné', 'District des Savanes'),
  ('Tengréla', 'District des Savanes'),

  -- District de la Vallée du Bandama
  ('Bouaké', 'District de la Vallée du Bandama'),
  ('Katiola', 'District de la Vallée du Bandama'),
  ('Dabakala', 'District de la Vallée du Bandama'),
  ('Béoumi', 'District de la Vallée du Bandama'),

  -- District du Woroba
  ('Séguéla', 'District du Woroba'),
  ('Mankono', 'District du Woroba'),
  ('Touba', 'District du Woroba'),

  -- District du Zanzan
  ('Bondoukou', 'District du Zanzan'),
  ('Bouna', 'District du Zanzan'),
  ('Tanda', 'District du Zanzan'),

  -- District du Denguélé
  ('Minignan', 'District du Denguélé'),
  ('Samatiguila', 'District du Denguélé'),

  -- Frontières et ports
  ('Frontière Ghana - Noé', 'Frontière Ghana'),
  ('Frontière Ghana - Elubo', 'Frontière Ghana'),
  ('Frontière Burkina Faso - Ouangolodougou', 'Frontière Burkina Faso'),
  ('Frontière Mali - Tengrela', 'Frontière Mali'),
  ('Port Autonome San-Pédro', 'Port'),
  ('Port Autonome Abidjan', 'Port')
ON CONFLICT (nom) DO NOTHING;

-- =====================================================
-- SEED DATA - TYPE_CONTENEUR (Container types)
-- =====================================================
INSERT INTO public.TYPE_CONTENEUR (nom, taille_pieds, description) VALUES
  ('20 pieds standard', 20, 'Conteneur standard de 20 pieds (TEU)'),
  ('40 pieds standard', 40, 'Conteneur standard de 40 pieds (FEU)'),
  ('40 pieds High Cube', 40, 'Conteneur 40 pieds haute capacité'),
  ('45 pieds High Cube', 45, 'Conteneur 45 pieds haute capacité')
ON CONFLICT (nom) DO NOTHING;

-- =====================================================
-- SEED DATA - CHAUFFEUR (Test drivers)
-- =====================================================
INSERT INTO public.CHAUFFEUR (nom, prenom, telephone, numero_permis, date_embauche, statut) VALUES
  ('Kouassi', 'Jean-Baptiste', '+225 07 12 34 56 78', 'CI-AB-123456', '2020-03-15', 'actif'),
  ('Coulibaly', 'Mamadou', '+225 05 23 45 67 89', 'CI-AB-234567', '2019-06-22', 'actif'),
  ('Touré', 'Ibrahim', '+225 01 34 56 78 90', 'CI-AB-345678', '2021-01-10', 'actif'),
  ('Koné', 'Seydou', '+225 07 45 67 89 01', 'CI-AB-456789', '2018-11-05', 'actif'),
  ('Bamba', 'Youssouf', '+225 05 56 78 90 12', 'CI-AB-567890', '2022-04-18', 'actif'),
  ('Sangaré', 'Adama', '+225 01 67 89 01 23', 'CI-AB-678901', '2020-09-30', 'actif'),
  ('Diallo', 'Boubacar', '+225 07 78 90 12 34', 'CI-AB-789012', '2019-02-14', 'actif'),
  ('N''Guessan', 'Eric', '+225 05 89 01 23 45', 'CI-AB-890123', '2021-07-08', 'actif')
ON CONFLICT (numero_permis) DO NOTHING;

-- =====================================================
-- SEED DATA - VEHICULE (Test vehicles)
-- =====================================================
INSERT INTO public.VEHICULE (immatriculation, marque, modele, annee, type_carburant, kilometrage_actuel, statut) VALUES
  ('CI-1234-AB', 'Mercedes-Benz', 'Actros 1845', 2020, 'gasoil', 125000, 'actif'),
  ('CI-2345-BC', 'Volvo', 'FH16 750', 2019, 'gasoil', 185000, 'actif'),
  ('CI-3456-CD', 'Scania', 'R450', 2021, 'gasoil', 95000, 'actif'),
  ('CI-4567-DE', 'DAF', 'XF 480', 2018, 'gasoil', 245000, 'actif'),
  ('CI-5678-EF', 'MAN', 'TGX 18.440', 2020, 'gasoil', 145000, 'actif'),
  ('CI-6789-FG', 'Renault', 'T High 520', 2019, 'gasoil', 175000, 'actif'),
  ('CI-7890-GH', 'Iveco', 'Stralis 460', 2022, 'gasoil', 65000, 'actif'),
  ('CI-8901-HI', 'Mercedes-Benz', 'Actros 2545', 2021, 'gasoil', 105000, 'actif'),
  ('CI-9012-IJ', 'Volvo', 'FH 460', 2020, 'gasoil', 135000, 'actif'),
  ('CI-0123-JK', 'Scania', 'S500', 2018, 'gasoil', 215000, 'actif')
ON CONFLICT (immatriculation) DO NOTHING;

-- =====================================================
-- SEED DATA - SOUS_TRAITANT (Test subcontractors)
-- =====================================================
INSERT INTO public.SOUS_TRAITANT (nom_entreprise, contact_principal, telephone, email, adresse, statut) VALUES
  ('Transport Express CI', 'Koné Michel', '+225 27 20 12 34 56', 'contact@transportexpress.ci', 'Zone Industrielle, Yopougon, Abidjan', 'actif'),
  ('LogiTrans Côte d''Ivoire', 'Diaby Mariame', '+225 27 20 23 45 67', 'info@logitrans.ci', 'Rue du Commerce, Plateau, Abidjan', 'actif'),
  ('Transcargo Services', 'Ouattara Souleymane', '+225 27 20 34 56 78', 'contact@transcargo.ci', 'Boulevard VGE, Marcory, Abidjan', 'actif'),
  ('Africa Container Transport', 'N''Dri Françoise', '+225 27 20 45 67 89', 'act@africontainer.ci', 'Zone Portuaire, Port, Abidjan', 'actif')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS - Seed data documentation
-- =====================================================
COMMENT ON TABLE public.LOCALITE IS 'Seeded with 64 major cities and locations across all districts of Côte d''Ivoire plus border crossings and ports';
COMMENT ON TABLE public.TYPE_CONTENEUR IS 'Seeded with 4 standard container types: 20'', 40'', 40'' HC, 45'' HC';
COMMENT ON TABLE public.CHAUFFEUR IS 'Seeded with 8 test drivers with realistic Ivorian names';
COMMENT ON TABLE public.VEHICULE IS 'Seeded with 10 test vehicles from major European truck manufacturers';
COMMENT ON TABLE public.SOUS_TRAITANT IS 'Seeded with 4 test subcontractor companies';
