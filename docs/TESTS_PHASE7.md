# Tests Phase 7 - PWA et Mode Hors Ligne

**Date**: 25 janvier 2025
**Phase**: 7 - PWA et mode hors ligne
**Statut**: Tests manuels requis

## Objectifs de Test

Valider le fonctionnement complet de l'application en mode Progressive Web App (PWA) avec capacités hors ligne, optimisé pour les conditions de connectivité instables en Côte d'Ivoire.

## Prérequis

- Serveur de développement lancé: `pnpm dev`
- Application accessible via HTTPS (requis pour PWA en production)
- Navigateurs de test: Chrome/Edge (Desktop), Safari (iOS), Chrome (Android)
- DevTools ouverts (onglet Application/Storage)

## 1. Tests d'Installation PWA

### 1.1 Test Installation - Desktop (Chrome/Edge)

**Objectif**: Vérifier l'installation PWA sur ordinateur

**Procédure**:

1. Ouvrir l'application dans Chrome/Edge
2. Vérifier l'apparition du prompt d'installation (carte en bas à droite)
3. Cliquer sur "Installer l'application"
4. Confirmer l'installation dans le dialogue natif
5. Vérifier que l'application s'ouvre dans une fenêtre dédiée
6. Vérifier la présence de l'icône dans le menu Démarrer/Applications

**Résultat attendu**:

- ✅ Prompt d'installation affiché automatiquement
- ✅ Installation réussie avec fenêtre dédiée
- ✅ Icône ajoutée au système
- ✅ Raccourcis rapides fonctionnels (Dashboard, Nouveau Trajet)

### 1.2 Test Installation - iOS (Safari)

**Objectif**: Vérifier les instructions d'installation iOS

**Procédure**:

1. Ouvrir l'application dans Safari iOS
2. Vérifier l'apparition du prompt avec instructions manuelles
3. Suivre les étapes affichées:
   - Appuyer sur l'icône Partager
   - Sélectionner "Sur l'écran d'accueil"
   - Appuyer sur "Ajouter"
4. Vérifier l'icône sur l'écran d'accueil
5. Lancer l'application depuis l'icône

**Résultat attendu**:

- ✅ Instructions iOS claires et en français
- ✅ Icône ajoutée à l'écran d'accueil
- ✅ Application s'ouvre en plein écran sans barre d'adresse
- ✅ Mode standalone détecté

### 1.3 Test Installation - Android (Chrome)

**Objectif**: Vérifier l'installation PWA sur Android

**Procédure**:

1. Ouvrir l'application dans Chrome Android
2. Vérifier l'apparition du prompt d'installation
3. Cliquer sur "Installer l'application"
4. Confirmer dans le dialogue natif Android
5. Vérifier l'icône sur l'écran d'accueil
6. Lancer l'application

**Résultat attendu**:

- ✅ Prompt natif Android affiché
- ✅ Installation réussie
- ✅ Icône avec nom "Transport Manager"
- ✅ Application s'ouvre comme app native

## 2. Tests de Mise en Cache

### 2.1 Test Cache des Pages

**Objectif**: Vérifier la mise en cache des pages visitées

**Procédure**:

1. Naviguer vers les pages suivantes (en ligne):
   - Dashboard (/)
   - Liste des trajets (/trajets)
   - Liste des chauffeurs (/chauffeurs)
   - Liste des véhicules (/vehicules)
2. Ouvrir DevTools > Application > Cache Storage
3. Vérifier la présence des ressources cachées
4. Passer en mode hors ligne (DevTools > Network > Offline)
5. Rafraîchir chaque page visitée

**Résultat attendu**:

- ✅ Cache Storage contient les pages visitées
- ✅ Pages s'affichent correctement en mode offline
- ✅ Données précédemment chargées visibles
- ✅ Pas d'erreur de chargement

### 2.2 Test Cache des Assets

**Objectif**: Vérifier la mise en cache des ressources statiques

**Procédure**:

1. Observer le chargement initial (Network tab)
2. Vérifier la présence dans le cache:
   - Images (icons/_, images/_)
   - CSS (\_next/static/css/\*)
   - JavaScript (\_next/static/chunks/\*)
3. Passer en mode offline
4. Recharger l'application
5. Vérifier que tous les assets se chargent

**Résultat attendu**:

- ✅ Assets mis en cache avec stratégie CacheFirst
- ✅ Images chargées depuis le cache (30 jours)
- ✅ CSS/JS chargés depuis le cache (7 jours)
- ✅ Aucun appel réseau pour assets cachés

### 2.3 Test Cache Supabase API

**Objectif**: Vérifier le cache des appels API Supabase

**Procédure**:

1. Charger le dashboard avec KPIs
2. Observer les appels Supabase dans Network
3. Vérifier dans Cache Storage > supabase-api-cache
4. Recharger la page (en ligne)
5. Vérifier que les données viennent du cache (NetworkFirst)

**Résultat attendu**:

- ✅ Réponses Supabase mises en cache (1 jour)
- ✅ Stratégie NetworkFirst appliquée
- ✅ Fallback sur cache si réseau échoue
- ✅ Données fraîches si réseau disponible

## 3. Tests de Détection Offline

### 3.1 Test Indicateur de Connexion

**Objectif**: Vérifier l'affichage du statut de connexion

**Procédure**:

1. Observer l'absence d'indicateur en mode online
2. Passer en mode offline (DevTools)
3. Vérifier l'apparition du bandeau orange "Vous êtes hors ligne"
4. Compter les opérations en attente (si présentes)
5. Repasser en mode online
6. Observer la disparition du bandeau après sync

**Résultat attendu**:

- ✅ Bandeau orange affiché immédiatement en offline
- ✅ Message "Vous êtes hors ligne" en français
- ✅ Compteur d'opérations en attente visible
- ✅ Bandeau disparaît automatiquement après sync

### 3.2 Test Polling de Connexion

**Objectif**: Vérifier la détection par polling (5 secondes)

**Procédure**:

1. Démarrer en mode online
2. Désactiver le WiFi/données mobiles au niveau système (pas DevTools)
3. Attendre max 5 secondes
4. Vérifier l'apparition du bandeau offline
5. Réactiver la connexion
6. Attendre max 5 secondes
7. Vérifier la détection de reconnexion

**Résultat attendu**:

- ✅ Détection offline dans les 5 secondes
- ✅ Bandeau affiché même sans événement browser
- ✅ Détection reconnexion dans les 5 secondes
- ✅ Sync automatique après reconnexion

## 4. Tests de Queue de Synchronisation

### 4.1 Test Création Offline - Trajet

**Objectif**: Créer un trajet hors ligne et vérifier la synchronisation

**Procédure**:

1. Passer en mode offline
2. Naviguer vers /trajets/nouveau
3. Remplir le formulaire de création de trajet:
   - Date: aujourd'hui
   - Chauffeur: sélectionner dans la liste
   - Véhicule: sélectionner dans la liste
   - Localités: sélectionner départ et arrivée
   - Kilométrage: km_depart < km_retour
   - Carburant: litrage et montant
4. Soumettre le formulaire
5. Vérifier le message de succès
6. Ouvrir DevTools > Application > IndexedDB > TransportManagerDB > sync_queue
7. Vérifier la présence de l'opération "create" pour "trajet"
8. Repasser en mode online
9. Attendre la synchronisation automatique (max 5 secondes)
10. Vérifier la disparition de l'item dans sync_queue
11. Vérifier la présence du trajet dans Supabase

**Résultat attendu**:

- ✅ Formulaire fonctionnel offline
- ✅ Validation Zod appliquée
- ✅ Opération ajoutée à sync_queue
- ✅ Sync automatique à la reconnexion
- ✅ Trajet créé dans Supabase
- ✅ Queue vidée après sync réussie

### 4.2 Test Modification Offline - Chauffeur

**Objectif**: Modifier un chauffeur hors ligne

**Procédure**:

1. En mode online, naviguer vers la page d'un chauffeur
2. Passer en mode offline
3. Cliquer sur "Modifier"
4. Modifier des champs (nom, téléphone, statut)
5. Soumettre la modification
6. Vérifier l'ajout dans sync_queue (operation: "update")
7. Repasser en mode online
8. Vérifier la sync automatique
9. Vérifier les modifications dans Supabase

**Résultat attendu**:

- ✅ Modification enregistrée offline
- ✅ Operation "update" dans sync_queue
- ✅ Sync automatique réussie
- ✅ Modifications appliquées dans Supabase

### 4.3 Test Suppression Offline - Véhicule

**Objectif**: Supprimer un véhicule hors ligne

**Procédure**:

1. En mode online, naviguer vers la liste des véhicules
2. Passer en mode offline
3. Cliquer sur "Supprimer" pour un véhicule sans trajets associés
4. Confirmer la suppression
5. Vérifier l'ajout dans sync_queue (operation: "delete")
6. Repasser en mode online
7. Vérifier la sync automatique
8. Vérifier la suppression dans Supabase

**Résultat attendu**:

- ✅ Suppression enregistrée offline
- ✅ Operation "delete" dans sync_queue
- ✅ Sync automatique réussie
- ✅ Véhicule supprimé de Supabase

## 5. Tests de Gestion d'Erreurs Sync

### 5.1 Test Retry Logic

**Objectif**: Vérifier le système de retry en cas d'échec

**Procédure**:

1. Créer une opération offline (ex: trajet)
2. Simuler un échec de connexion:
   - Repasser en mode online
   - Bloquer temporairement l'accès à Supabase (pare-feu/hosts)
3. Observer l'échec de sync
4. Vérifier dans sync_queue que retry_count a augmenté
5. Vérifier que last_error contient un message d'erreur
6. Rétablir la connexion Supabase
7. Attendre ou forcer une nouvelle tentative
8. Vérifier la sync réussie

**Résultat attendu**:

- ✅ Échec de sync capturé proprement
- ✅ retry_count incrémenté
- ✅ last_error enregistré
- ✅ Opération reste dans la queue
- ✅ Retry automatique réussit plus tard

### 5.2 Test Opérations Multiples

**Objectif**: Synchroniser plusieurs opérations en batch

**Procédure**:

1. Passer en mode offline
2. Créer 3 trajets différents
3. Modifier 2 chauffeurs
4. Supprimer 1 véhicule
5. Vérifier sync_queue contient 6 opérations
6. Repasser en mode online
7. Observer la sync groupée par entité
8. Vérifier l'ordre de traitement (trajet → chauffeur → vehicule)
9. Vérifier que toutes les opérations ont réussi

**Résultat attendu**:

- ✅ 6 opérations dans la queue
- ✅ Sync groupée par type d'entité
- ✅ Traitement séquentiel par entité
- ✅ Toutes les opérations synchronisées
- ✅ Queue complètement vidée

## 6. Tests de Page Offline Fallback

### 6.1 Test Page Non-Cachée

**Objectif**: Vérifier le fallback pour pages non visitées

**Procédure**:

1. Passer en mode offline
2. Tenter d'accéder à une page jamais visitée (ex: /rapports si pas encore visité)
3. Vérifier la redirection vers /~offline
4. Observer le contenu de la page:
   - Icône WifiOff
   - Message "Vous êtes hors ligne"
   - Informations sur les capacités offline
   - Bouton "Réessayer"
   - Bouton "Retour à l'accueil"
5. Cliquer sur "Réessayer" (reste offline)
6. Repasser en mode online
7. Cliquer sur "Réessayer"
8. Vérifier le chargement de la page demandée

**Résultat attendu**:

- ✅ Redirection automatique vers /~offline
- ✅ Page offline affichée correctement
- ✅ Messages en français
- ✅ Boutons fonctionnels
- ✅ Retry fonctionne après reconnexion

## 7. Tests de Performance

### 7.1 Test Temps de Chargement

**Objectif**: Mesurer les performances PWA

**Procédure**:

1. Vider le cache (Hard Reload)
2. Charger l'application (premier chargement)
3. Noter le temps dans Network tab
4. Recharger (chargement depuis cache)
5. Noter le temps d'affichage
6. Calculer l'amélioration

**Résultat attendu**:

- ✅ Premier chargement < 3 secondes
- ✅ Chargements suivants < 1 seconde
- ✅ Amélioration > 60% avec cache
- ✅ LCP (Largest Contentful Paint) < 2.5s

### 7.2 Test IndexedDB Performance

**Objectif**: Vérifier les performances de Dexie.js

**Procédure**:

1. Créer 10 opérations offline rapidement
2. Mesurer le temps d'ajout à sync_queue
3. Repasser en mode online
4. Mesurer le temps de synchronisation totale
5. Vérifier l'absence de blocage UI

**Résultat attendu**:

- ✅ Ajout à IndexedDB < 100ms par opération
- ✅ Sync de 10 opérations < 5 secondes
- ✅ UI reste réactive pendant sync
- ✅ Aucun freeze ou lag visible

## 8. Tests Cross-Browser

### 8.1 Test Chrome Desktop

**Objectif**: Validation complète sur Chrome

**Tests à effectuer**:

- [x] Installation PWA
- [x] Détection offline
- [x] Sync queue
- [x] Cache strategies
- [x] Service Worker

**Notes spécifiques**: Support complet, référence principale

### 8.2 Test Edge Desktop

**Objectif**: Validation sur Edge (Chromium)

**Tests à effectuer**:

- [x] Installation PWA
- [x] Détection offline
- [x] Sync queue
- [x] Cache strategies

**Notes spécifiques**: Comportement identique à Chrome

### 8.3 Test Safari iOS

**Objectif**: Validation sur iOS (conditions réelles terrain)

**Tests à effectuer**:

- [x] Installation manuelle
- [x] Mode standalone
- [x] Détection offline
- [x] IndexedDB
- [x] Cache

**Notes spécifiques**:

- Pas de BeforeInstallPrompt (instructions manuelles)
- Limitations IndexedDB (50MB max)
- Service Worker support complet depuis iOS 11.3

### 8.4 Test Chrome Android

**Objectif**: Validation sur Android (principale plateforme cible)

**Tests à effectuer**:

- [x] Installation PWA native
- [x] Notifications (si implémentées)
- [x] Mode offline terrain
- [x] Sync background

**Notes spécifiques**:

- Support complet PWA
- Background Sync API disponible
- Plateforme prioritaire pour Côte d'Ivoire

## 9. Tests Conditions Réelles Côte d'Ivoire

### 9.1 Test Connexion Instable

**Objectif**: Simuler les conditions réseau réelles

**Procédure**:

1. Utiliser DevTools > Network > Throttling > Custom
2. Configurer:
   - Download: 400 Kbps
   - Upload: 200 Kbps
   - Latency: 400ms
3. Tester les opérations:
   - Chargement dashboard
   - Création trajet
   - Consultation données
4. Simuler des coupures intermittentes (Online/Offline répétés)
5. Vérifier la robustesse de l'application

**Résultat attendu**:

- ✅ Application reste utilisable avec connexion lente
- ✅ Gestion élégante des timeouts
- ✅ Pas de perte de données lors des coupures
- ✅ Sync reprend automatiquement

### 9.2 Test Zone Sans Réseau

**Objectif**: Vérifier l'utilisation complète offline

**Procédure**:

1. Charger l'application en mode online
2. Visiter les principales pages
3. Passer complètement offline (mode avion)
4. Utiliser l'application pendant 15 minutes:
   - Créer 3 trajets
   - Modifier 2 chauffeurs
   - Consulter statistiques véhicules
5. Revenir en zone avec réseau
6. Vérifier la sync automatique de toutes les opérations

**Résultat attendu**:

- ✅ Toutes les fonctionnalités disponibles offline
- ✅ Aucun blocage ou message d'erreur
- ✅ Données locales accessibles
- ✅ Sync complète et réussie au retour en ligne

## 10. Tests de Sécurité

### 10.1 Test HTTPS Requirement

**Objectif**: Vérifier que PWA nécessite HTTPS

**Procédure**:

1. Tenter d'accéder en HTTP (production)
2. Vérifier la redirection HTTPS
3. Vérifier que Service Worker ne s'active pas en HTTP

**Résultat attendu**:

- ✅ Redirection automatique vers HTTPS
- ✅ Service Worker inactif en HTTP
- ✅ Message d'avertissement si nécessaire

### 10.2 Test RLS Policies Offline

**Objectif**: Vérifier que les permissions sont respectées

**Procédure**:

1. Se connecter en tant que chauffeur
2. Passer offline
3. Tenter de créer un trajet pour un autre chauffeur
4. Vérifier que la validation bloque l'opération
5. Repasser online
6. Vérifier qu'aucune opération non autorisée n'est synchronisée

**Résultat attendu**:

- ✅ Validation client respecte les rôles
- ✅ Opérations non autorisées rejetées
- ✅ RLS policies appliquées côté serveur
- ✅ Aucune fuite de données

## Critères d'Acceptation Phase 7

### Fonctionnalités Essentielles

- ✅ Installation PWA fonctionnelle (Desktop, iOS, Android)
- ✅ Mode offline complet (création, modification, consultation)
- ✅ Synchronisation automatique à la reconnexion
- ✅ Gestion d'erreurs et retry logic
- ✅ Détection connexion fiable (événements + polling)
- ✅ Cache stratégies optimisées (pages, assets, API)
- ✅ Page offline fallback
- ✅ Prompt d'installation adaptatif (plateforme)

### Performance

- ✅ Premier chargement < 3 secondes
- ✅ Chargements suivants < 1 seconde
- ✅ Sync de 10 opérations < 5 secondes
- ✅ UI réactive pendant sync (pas de freeze)

### Robustesse

- ✅ Aucune perte de données en offline
- ✅ Gestion élégante des erreurs de sync
- ✅ Retry automatique après échec
- ✅ Support connexions instables

### Sécurité

- ✅ HTTPS requis en production
- ✅ Validation client des permissions
- ✅ RLS policies respectées
- ✅ Données sensibles protégées

## Checklist de Validation Finale

- [ ] Tous les tests de la section 1 (Installation PWA) passés
- [ ] Tous les tests de la section 2 (Mise en cache) passés
- [ ] Tous les tests de la section 3 (Détection offline) passés
- [ ] Tous les tests de la section 4 (Queue sync) passés
- [ ] Tous les tests de la section 5 (Gestion erreurs) passés
- [ ] Tous les tests de la section 6 (Fallback) passés
- [ ] Tous les tests de la section 7 (Performance) passés
- [ ] Tous les tests de la section 8 (Cross-browser) passés
- [ ] Tous les tests de la section 9 (Conditions réelles) passés
- [ ] Tous les tests de la section 10 (Sécurité) passés
- [ ] Documentation mise à jour (PLAN_DEVELOPPEMENT.md)
- [ ] Phase 7 validée et prête pour production

## Notes d'Implémentation

### Fichiers Créés/Modifiés

- `lib/db/offline-db.ts` - Schéma Dexie.js (8 tables)
- `hooks/use-online-status.ts` - Détection connexion
- `hooks/use-sync-queue.ts` - Gestion queue sync
- `lib/sync/sync-manager.ts` - Moteur de synchronisation
- `components/offline/offline-indicator.tsx` - Indicateur UI
- `app/(dashboard)/~offline/page.tsx` - Page fallback
- `hooks/use-install-prompt.ts` - Gestion installation
- `components/pwa/install-prompt.tsx` - Prompt UI
- `next.config.ts` - Configuration PWA et caching
- `public/manifest.json` - Métadonnées PWA enrichies

### Technologies

- **@ducanh2912/next-pwa** - Service Worker et caching
- **Dexie.js 4.2.1** - Base de données IndexedDB
- **dexie-react-hooks 4.2.0** - Hooks React pour Dexie
- **Workbox** - Stratégies de cache (via next-pwa)

### Patterns Implémentés

- Singleton SyncManager pour coordination globale
- Live Queries Dexie pour réactivité temps réel
- Polling connexion (5s) + événements browser
- Retry logic avec compteur et erreurs
- Groupement opérations par entité pour sync
- Détection plateforme pour prompt adaptatif
- Cache strategies différenciées par type de ressource
