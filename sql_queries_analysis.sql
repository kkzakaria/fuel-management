-- ============================================
-- REQUÊTES D'ANALYSE - SUIVI TRANSPORT
-- ============================================

-- ============================================
-- 1. ANALYSE CONTENEURS (KPI PRINCIPAL)
-- ============================================

-- Vue d'ensemble des conteneurs livrés
SELECT 
    COUNT(DISTINCT ct.id_trajet) as nombre_trajets_avec_conteneurs,
    SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END) as total_conteneurs_20,
    SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END) as total_conteneurs_40,
    SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END) as total_conteneurs_45,
    SUM(ct.quantite) as total_general_conteneurs
FROM CONTENEUR_TRAJET ct
JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE ct.statut_livraison = 'Livre';

-- Conteneurs livrés par période (semaine, mois, année)
SELECT 
    DATE_FORMAT(t.date_trajet, '%Y-%m') as periode_mois,
    WEEK(t.date_trajet, 1) as semaine_numero,
    SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END) as conteneurs_20,
    SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END) as conteneurs_40,
    SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END) as conteneurs_45,
    SUM(ct.quantite) as total_conteneurs,
    COUNT(DISTINCT t.id_trajet) as nombre_livraisons
FROM TRAJET t
JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet
JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE ct.statut_livraison = 'Livre'
GROUP BY DATE_FORMAT(t.date_trajet, '%Y-%m'), WEEK(t.date_trajet, 1)
ORDER BY periode_mois DESC, semaine_numero DESC;

-- Conteneurs livrés cette semaine vs semaine dernière
SELECT 
    'Cette semaine' as periode,
    SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END) as conteneurs_20,
    SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END) as conteneurs_40,
    SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END) as conteneurs_45,
    SUM(ct.quantite) as total
FROM TRAJET t
JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet
JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE WEEK(t.date_trajet, 1) = WEEK(CURDATE(), 1)
  AND YEAR(t.date_trajet) = YEAR(CURDATE())
  AND ct.statut_livraison = 'Livre'

UNION ALL

SELECT 
    'Semaine dernière',
    SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END),
    SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END),
    SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END),
    SUM(ct.quantite)
FROM TRAJET t
JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet
JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE WEEK(t.date_trajet, 1) = WEEK(CURDATE(), 1) - 1
  AND ct.statut_livraison = 'Livre';

-- Conteneurs livrés ce mois vs mois dernier
SELECT 
    'Ce mois' as periode,
    SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END) as conteneurs_20,
    SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END) as conteneurs_40,
    SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END) as conteneurs_45,
    SUM(ct.quantite) as total
FROM TRAJET t
JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet
JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE MONTH(t.date_trajet) = MONTH(CURDATE())
  AND YEAR(t.date_trajet) = YEAR(CURDATE())
  AND ct.statut_livraison = 'Livre'

UNION ALL

SELECT 
    'Mois dernier',
    SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END),
    SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END),
    SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END),
    SUM(ct.quantite)
FROM TRAJET t
JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet
JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE MONTH(t.date_trajet) = MONTH(CURDATE()) - 1
  AND ct.statut_livraison = 'Livre';

-- Performance hebdomadaire (12 dernières semaines)
SELECT 
    CONCAT(YEAR(t.date_trajet), '-S', LPAD(WEEK(t.date_trajet, 1), 2, '0')) as semaine,
    SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END) as tc20,
    SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END) as tc40,
    SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END) as tc45,
    SUM(ct.quantite) as total
FROM TRAJET t
JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet
JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE t.date_trajet >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
  AND ct.statut_livraison = 'Livre'
GROUP BY YEAR(t.date_trajet), WEEK(t.date_trajet, 1)
ORDER BY semaine DESC;

-- Conteneurs par destination
SELECT 
    l.nom_ville as destination,
    SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END) as conteneurs_20,
    SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END) as conteneurs_40,
    SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END) as conteneurs_45,
    SUM(ct.quantite) as total_conteneurs,
    COUNT(DISTINCT t.id_trajet) as nombre_livraisons
FROM TRAJET t
JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet
JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
JOIN LOCALITE l ON t.id_localite_destination = l.id_localite
WHERE ct.statut_livraison = 'Livre'
GROUP BY l.id_localite, l.nom_ville
ORDER BY total_conteneurs DESC;

-- Coût moyen par conteneur livré (par type)
SELECT 
    tc.taille as type_conteneur,
    COUNT(ct.id_conteneur_trajet) as nombre_livraisons,
    SUM(ct.quantite) as quantite_totale,
    ROUND(AVG(t.montant_litrage + t.frais_route), 0) as cout_moyen_trajet,
    ROUND(SUM(t.montant_litrage + t.frais_route) / SUM(ct.quantite), 0) as cout_moyen_par_conteneur
FROM CONTENEUR_TRAJET ct
JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
JOIN TRAJET t ON ct.id_trajet = t.id_trajet
WHERE ct.statut_livraison = 'Livre'
GROUP BY tc.taille
ORDER BY tc.taille;


-- ============================================
-- 2. ANALYSE PAR CHAUFFEUR (avec conteneurs)
-- ============================================

-- Statistiques complètes par chauffeur (avec conteneurs)
SELECT 
    c.nom,
    c.prenom,
    COUNT(DISTINCT t.id_trajet) as nombre_trajets,
    SUM(t.parcours_total) as km_total,
    ROUND(AVG(t.consommation_au_100), 2) as consommation_moyenne,
    ROUND(SUM(t.montant_litrage), 0) as cout_total_carburant,
    SUM(t.frais_route) as total_frais_route,
    -- Conteneurs livrés
    SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END) as conteneurs_20_livres,
    SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END) as conteneurs_40_livres,
    SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END) as conteneurs_45_livres,
    SUM(COALESCE(ct.quantite, 0)) as total_conteneurs_livres
FROM CHAUFFEUR c
LEFT JOIN TRAJET t ON c.id_chauffeur = t.id_chauffeur
LEFT JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet AND ct.statut_livraison = 'Livre'
LEFT JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE c.actif = TRUE
GROUP BY c.id_chauffeur, c.nom, c.prenom
ORDER BY total_conteneurs_livres DESC;

-- Top 5 chauffeurs les plus économes
SELECT 
    c.nom,
    c.prenom,
    ROUND(AVG(t.consommation_au_100), 2) as consommation_moyenne,
    COUNT(t.id_trajet) as nombre_trajets
FROM CHAUFFEUR c
JOIN TRAJET t ON c.id_chauffeur = t.id_chauffeur
GROUP BY c.id_chauffeur, c.nom, c.prenom
HAVING COUNT(t.id_trajet) >= 5
ORDER BY consommation_moyenne ASC
LIMIT 5;

-- Chauffeurs avec écarts de litrage suspects (> 10L)
SELECT 
    c.nom,
    c.prenom,
    t.date_trajet,
    v.immatriculation,
    t.litrage_prevu,
    t.litrage_station,
    t.ecart_litrage,
    ld.nom_ville as depart,
    la.nom_ville as destination
FROM TRAJET t
JOIN CHAUFFEUR c ON t.id_chauffeur = c.id_chauffeur
JOIN VEHICULE v ON t.id_vehicule = v.id_vehicule
JOIN LOCALITE ld ON t.id_localite_depart = ld.id_localite
JOIN LOCALITE la ON t.id_localite_destination = la.id_localite
WHERE ABS(t.ecart_litrage) > 10
ORDER BY ABS(t.ecart_litrage) DESC;


-- ============================================
-- 2. ANALYSE PAR VÉHICULE
-- ============================================

-- Performance de chaque véhicule
SELECT 
    v.immatriculation,
    v.marque,
    v.modele,
    COUNT(t.id_trajet) as nombre_trajets,
    SUM(t.parcours_total) as km_parcourus,
    ROUND(AVG(t.consommation_au_100), 2) as consommation_moyenne,
    ROUND(MIN(t.consommation_au_100), 2) as consommation_min,
    ROUND(MAX(t.consommation_au_100), 2) as consommation_max,
    ROUND(SUM(t.montant_litrage), 0) as cout_total_carburant,
    ROUND(SUM(t.montant_litrage) / SUM(t.parcours_total) * 100, 2) as cout_par_100km
FROM VEHICULE v
LEFT JOIN TRAJET t ON v.id_vehicule = t.id_vehicule
WHERE v.actif = TRUE
GROUP BY v.id_vehicule, v.immatriculation, v.marque, v.modele
ORDER BY consommation_moyenne ASC;

-- Historique d'un véhicule spécifique
SELECT 
    t.date_trajet,
    c.nom as chauffeur,
    ld.nom_ville as depart,
    la.nom_ville as destination,
    t.parcours_total,
    t.litrage_station,
    t.consommation_au_100,
    t.montant_litrage,
    t.motif_mission,
    t.etat_retour
FROM TRAJET t
JOIN CHAUFFEUR c ON t.id_chauffeur = c.id_chauffeur
JOIN LOCALITE ld ON t.id_localite_depart = ld.id_localite
JOIN LOCALITE la ON t.id_localite_destination = la.id_localite
WHERE t.id_vehicule = (SELECT id_vehicule FROM VEHICULE WHERE immatriculation = 'AA443CZ')
ORDER BY t.date_trajet DESC;


-- ============================================
-- 3. ANALYSE PAR DESTINATION
-- ============================================

-- Coûts moyens par destination
SELECT 
    la.nom_ville as destination,
    COUNT(t.id_trajet) as nombre_trajets,
    ROUND(AVG(t.parcours_total), 0) as distance_moyenne,
    ROUND(AVG(t.litrage_station), 1) as litrage_moyen,
    ROUND(AVG(t.consommation_au_100), 2) as consommation_moyenne,
    ROUND(AVG(t.montant_litrage), 0) as cout_carburant_moyen,
    ROUND(AVG(t.frais_route), 0) as frais_route_moyens,
    ROUND(AVG(t.montant_litrage + t.frais_route), 0) as cout_total_moyen
FROM TRAJET t
JOIN LOCALITE la ON t.id_localite_destination = la.id_localite
GROUP BY la.id_localite, la.nom_ville
ORDER BY nombre_trajets DESC;

-- Routes les plus fréquentes
SELECT 
    ld.nom_ville as depart,
    la.nom_ville as destination,
    COUNT(t.id_trajet) as frequence,
    ROUND(AVG(t.parcours_total), 0) as distance_moyenne,
    ROUND(AVG(t.montant_litrage), 0) as cout_moyen,
    ROUND(AVG(t.consommation_au_100), 2) as consommation_moyenne
FROM TRAJET t
JOIN LOCALITE ld ON t.id_localite_depart = ld.id_localite
JOIN LOCALITE la ON t.id_localite_destination = la.id_localite
GROUP BY ld.nom_ville, la.nom_ville
ORDER BY frequence DESC;


-- ============================================
-- 4. ANALYSE TEMPORELLE
-- ============================================

-- Synthèse mensuelle
SELECT 
    YEAR(t.date_trajet) as annee,
    MONTH(t.date_trajet) as mois,
    COUNT(t.id_trajet) as nombre_trajets,
    SUM(t.parcours_total) as km_total,
    ROUND(SUM(t.montant_litrage), 0) as cout_carburant,
    ROUND(SUM(t.frais_route), 0) as frais_route,
    ROUND(SUM(t.montant_litrage + t.frais_route), 0) as cout_total,
    ROUND(AVG(t.consommation_au_100), 2) as consommation_moyenne
FROM TRAJET t
GROUP BY YEAR(t.date_trajet), MONTH(t.date_trajet)
ORDER BY annee DESC, mois DESC;

-- Évolution du prix du litre
SELECT 
    DATE(t.date_trajet) as date,
    ROUND(AVG(t.prix_litre_calcule), 0) as prix_moyen_litre,
    MIN(t.prix_litre_calcule) as prix_min,
    MAX(t.prix_litre_calcule) as prix_max,
    COUNT(t.id_trajet) as nombre_pleins
FROM TRAJET t
WHERE t.prix_litre_calcule > 0
GROUP BY DATE(t.date_trajet)
ORDER BY date DESC;

-- Comparaison hebdomadaire
SELECT 
    YEARWEEK(t.date_trajet) as semaine,
    COUNT(t.id_trajet) as nombre_trajets,
    ROUND(SUM(t.montant_litrage), 0) as depenses_carburant,
    ROUND(AVG(t.consommation_au_100), 2) as consommation_moyenne
FROM TRAJET t
WHERE t.date_trajet >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
GROUP BY YEARWEEK(t.date_trajet)
ORDER BY semaine DESC;


-- ============================================
-- 5. ANALYSE DES ÉCARTS ET ANOMALIES
-- ============================================

-- Détection d'anomalies de consommation (écart > 30% de la moyenne du véhicule)
WITH ConsommationVehicule AS (
    SELECT 
        id_vehicule,
        AVG(consommation_au_100) as conso_moyenne,
        STDDEV(consommation_au_100) as ecart_type
    FROM TRAJET
    GROUP BY id_vehicule
)
SELECT 
    t.date_trajet,
    v.immatriculation,
    c.nom as chauffeur,
    t.consommation_au_100,
    cv.conso_moyenne,
    ROUND(((t.consommation_au_100 - cv.conso_moyenne) / cv.conso_moyenne * 100), 1) as ecart_pourcent,
    t.motif_mission,
    t.commentaire
FROM TRAJET t
JOIN VEHICULE v ON t.id_vehicule = v.id_vehicule
JOIN CHAUFFEUR c ON t.id_chauffeur = c.id_chauffeur
JOIN ConsommationVehicule cv ON t.id_vehicule = cv.id_vehicule
WHERE ABS(t.consommation_au_100 - cv.conso_moyenne) > (cv.conso_moyenne * 0.3)
ORDER BY ABS(ecart_pourcent) DESC;

-- Écarts litrage significatifs par station
SELECT 
    t.date_trajet,
    c.nom as chauffeur,
    v.immatriculation,
    t.litrage_prevu,
    t.litrage_station,
    t.ecart_litrage,
    ROUND((t.ecart_litrage / t.litrage_prevu * 100), 1) as ecart_pourcent,
    t.montant_litrage
FROM TRAJET t
JOIN CHAUFFEUR c ON t.id_chauffeur = c.id_chauffeur
JOIN VEHICULE v ON t.id_vehicule = v.id_vehicule
WHERE t.litrage_prevu > 0 
  AND ABS(t.ecart_litrage / t.litrage_prevu) > 0.05
ORDER BY ABS(t.ecart_litrage) DESC;


-- ============================================
-- 6. ANALYSE FINANCIÈRE
-- ============================================

-- Tableau de bord financier global
SELECT 
    'Trajets Internes' as categorie,
    COUNT(*) as nombre_operations,
    ROUND(SUM(montant_litrage), 0) as cout_carburant,
    ROUND(SUM(frais_route), 0) as autres_frais,
    ROUND(SUM(montant_litrage + frais_route), 0) as total
FROM TRAJET
WHERE date_trajet >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)

UNION ALL

SELECT 
    'Sous-traitance' as categorie,
    COUNT(*) as nombre_operations,
    ROUND(SUM(cout_transport), 0) as cout_transport,
    0 as autres_frais,
    ROUND(SUM(cout_transport), 0) as total
FROM MISSION_SOUS_TRAITANCE
WHERE date_mission >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH);

-- Dépenses totales par mois
SELECT 
    DATE_FORMAT(date_trajet, '%Y-%m') as mois,
    ROUND(SUM(montant_litrage + frais_route), 0) as depenses_trajets_internes,
    (SELECT ROUND(SUM(cout_transport), 0) 
     FROM MISSION_SOUS_TRAITANCE 
     WHERE DATE_FORMAT(date_mission, '%Y-%m') = DATE_FORMAT(t.date_trajet, '%Y-%m')) as depenses_sous_traitance,
    ROUND(SUM(montant_litrage + frais_route), 0) + 
    COALESCE((SELECT SUM(cout_transport) 
              FROM MISSION_SOUS_TRAITANCE 
              WHERE DATE_FORMAT(date_mission, '%Y-%m') = DATE_FORMAT(t.date_trajet, '%Y-%m')), 0) as total_general
FROM TRAJET t
GROUP BY DATE_FORMAT(date_trajet, '%Y-%m')
ORDER BY mois DESC;


-- ============================================
-- 7. ANALYSE SOUS-TRAITANCE
-- ============================================

-- Performance des sous-traitants
SELECT 
    st.nom_entreprise,
    COUNT(m.id_mission) as nombre_missions,
    SUM(m.nb_conteneur_20 + m.nb_conteneur_40 + m.nb_conteneur_45) as total_conteneurs,
    ROUND(SUM(m.cout_transport), 0) as chiffre_affaires,
    ROUND(SUM(m.montant_90_pourcent), 0) as montant_paye,
    ROUND(SUM(m.reste_10_pourcent), 0) as solde_restant,
    ROUND(AVG(DATEDIFF(m.date_mission, m.date_programmation)), 1) as delai_moyen_jours
FROM SOUS_TRAITANT st
LEFT JOIN MISSION_SOUS_TRAITANCE m ON st.id_sous_traitant = m.id_sous_traitant
WHERE st.actif = TRUE
GROUP BY st.id_sous_traitant, st.nom_entreprise
ORDER BY chiffre_affaires DESC;

-- Missions en attente de paiement
SELECT 
    st.nom_entreprise,
    m.date_mission,
    m.nb_conteneur_20,
    m.nb_conteneur_40,
    m.nb_conteneur_45,
    m.cout_transport,
    m.reste_10_pourcent,
    m.statut_paiement,
    DATEDIFF(CURDATE(), m.date_mission) as jours_depuis_mission
FROM MISSION_SOUS_TRAITANCE m
JOIN SOUS_TRAITANT st ON m.id_sous_traitant = st.id_sous_traitant
WHERE m.statut_paiement != 'Tous Paye' 
   OR m.reste_10_pourcent > 0
ORDER BY m.date_mission ASC;


-- ============================================
-- 8. RAPPORTS SYNTHÉTIQUES
-- ============================================

-- Dashboard complet du mois en cours (avec conteneurs)
SELECT 
    'Nombre de trajets' as indicateur,
    CAST(COUNT(*) AS CHAR) as valeur
FROM TRAJET
WHERE MONTH(date_trajet) = MONTH(CURDATE()) AND YEAR(date_trajet) = YEAR(CURDATE())

UNION ALL

SELECT 
    'Conteneurs 20 pieds livrés',
    CAST(SUM(CASE WHEN tc.taille = '20' THEN ct.quantite ELSE 0 END) AS CHAR)
FROM TRAJET t
LEFT JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet AND ct.statut_livraison = 'Livre'
LEFT JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE MONTH(t.date_trajet) = MONTH(CURDATE()) AND YEAR(t.date_trajet) = YEAR(CURDATE())

UNION ALL

SELECT 
    'Conteneurs 40 pieds livrés',
    CAST(SUM(CASE WHEN tc.taille = '40' THEN ct.quantite ELSE 0 END) AS CHAR)
FROM TRAJET t
LEFT JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet AND ct.statut_livraison = 'Livre'
LEFT JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE MONTH(t.date_trajet) = MONTH(CURDATE()) AND YEAR(t.date_trajet) = YEAR(CURDATE())

UNION ALL

SELECT 
    'Conteneurs 45 pieds livrés',
    CAST(SUM(CASE WHEN tc.taille = '45' THEN ct.quantite ELSE 0 END) AS CHAR)
FROM TRAJET t
LEFT JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet AND ct.statut_livraison = 'Livre'
LEFT JOIN TYPE_CONTENEUR tc ON ct.id_type_conteneur = tc.id_type_conteneur
WHERE MONTH(t.date_trajet) = MONTH(CURDATE()) AND YEAR(t.date_trajet) = YEAR(CURDATE())

UNION ALL

SELECT 
    'Total conteneurs livrés',
    CAST(SUM(COALESCE(ct.quantite, 0)) AS CHAR)
FROM TRAJET t
LEFT JOIN CONTENEUR_TRAJET ct ON t.id_trajet = ct.id_trajet AND ct.statut_livraison = 'Livre'
WHERE MONTH(t.date_trajet) = MONTH(CURDATE()) AND YEAR(t.date_trajet) = YEAR(CURDATE())

UNION ALL

SELECT 
    'Kilomètres parcourus',
    CAST(SUM(parcours_total) AS CHAR)
FROM TRAJET
WHERE MONTH(date_trajet) = MONTH(CURDATE()) AND YEAR(date_trajet) = YEAR(CURDATE())

UNION ALL

SELECT 
    'Coût total carburant (FCFA)',
    CAST(ROUND(SUM(montant_litrage), 0) AS CHAR)
FROM TRAJET
WHERE MONTH(date_trajet) = MONTH(CURDATE()) AND YEAR(date_trajet) = YEAR(CURDATE())

UNION ALL

SELECT 
    'Consommation moyenne (L/100km)',
    CAST(ROUND(AVG(consommation_au_100), 2) AS CHAR)
FROM TRAJET
WHERE MONTH(date_trajet) = MONTH(CURDATE()) AND YEAR(date_trajet) = YEAR(CURDATE());

-- Classement destinations les plus coûteuses
SELECT 
    la.nom_ville as destination,
    COUNT(t.id_trajet) as frequence,
    ROUND(AVG(t.montant_litrage + t.frais_route), 0) as cout_moyen_total,
    ROUND(SUM(t.montant_litrage + t.frais_route), 0) as cout_total_cumule
FROM TRAJET t
JOIN LOCALITE la ON t.id_localite_destination = la.id_localite
WHERE t.date_trajet >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
GROUP BY la.id_localite, la.nom_ville
ORDER BY cout_total_cumule DESC
LIMIT 10;