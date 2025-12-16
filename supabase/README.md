# Supabase Database Setup

Instructions pour configurer et utiliser la base de données Supabase.

## Développement Local (Recommandé)

### Démarrage rapide

```bash
# Démarrer les services Supabase locaux
supabase start

# Réinitialiser la base avec migrations + seed chauffeurs
supabase db reset

# Créer les utilisateurs de test (via Supabase Admin API)
pnpm tsx scripts/seed-users.ts

# Accéder au Studio local
# http://127.0.0.1:54323
```

### Architecture du seeding

Le seeding utilise une approche en deux étapes :

1. **`supabase db reset`** - Applique les migrations et exécute `seed.sql` :
   - Crée les tables, vues, indexes et RLS policies
   - Met à jour les statuts des chauffeurs existants
   - Ajoute des chauffeurs supplémentaires pour la distribution des statuts

2. **`pnpm tsx scripts/seed-users.ts`** - Crée les utilisateurs via l'Admin API :
   - Utilise `supabase.auth.admin.createUser()` pour créer les utilisateurs
   - Met à jour les profils avec `.from('profiles').update()` (service_role bypass RLS)
   - Lie les chauffeurs aux comptes utilisateurs correspondants

### Utilisateurs de test

Après `supabase db reset` + `pnpm tsx scripts/seed-users.ts`, les utilisateurs suivants sont disponibles :

| Email                     | Mot de passe | Rôle         | Description                 |
| ------------------------- | ------------ | ------------ | --------------------------- |
| admin@transport.ci        | Test123!     | admin        | Accès complet au système    |
| gestionnaire@transport.ci | Test123!     | gestionnaire | Monitoring flotte, rapports |
| chauffeur1@transport.ci   | Test123!     | chauffeur    | Ses trajets uniquement      |
| chauffeur2@transport.ci   | Test123!     | chauffeur    | Ses trajets uniquement      |
| personnel@transport.ci    | Test123!     | personnel    | Saisie de données           |
| visiteur@transport.ci     | Test123!     | visiteur     | Lecture seule               |

### Chauffeurs de test (distribution des statuts)

| Statut    | Nombre | Pourcentage | Chauffeurs                              |
| --------- | ------ | ----------- | --------------------------------------- |
| actif     | 5      | 35.7%       | Kouassi, Coulibaly, Touré, Traoré, Soro |
| en_voyage | 4      | 28.6%       | Koné, Bamba, Yao, Aka                   |
| en_conge  | 2      | 14.3%       | Sangaré, Gnagne                         |
| suspendu  | 2      | 14.3%       | Diallo, Mensah                          |
| inactif   | 1      | 7.1%        | N'Guessan                               |
| **Total** | **14** | **100%**    |                                         |

## Déploiement Remote

### Via Supabase CLI

```bash
# Lier au projet remote
supabase link --project-ref <project-ref>

# Appliquer les migrations en ligne
supabase db push --linked

# Appliquer les migrations localement
supabase db push --local

# Générer les types TypeScript depuis la base de données en ligne
supabase gen types typescript --linked > lib/supabase/database.types.ts

# Générer les types TypeScript localement
supabase gen types typescript --local > lib/supabase/database.types.ts
```

### Seed des utilisateurs en production

Pour la production, créez les utilisateurs manuellement :

1. **Dashboard Supabase** : Authentication → Users → Add user
2. **Mettre à jour les profils** : Exécutez dans SQL Editor :
   ```sql
   -- Exemple pour un admin
   UPDATE public.profiles
   SET role = 'admin', nom = 'Nom', prenom = 'Prenom', is_active = true
   WHERE id = '<user-uuid>';
   ```

## Vérification post-migration

Exécutez ces queries pour vérifier l'installation :

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vérifier les données de seed
SELECT COUNT(*) FROM public.localite;        -- ~64 localités
SELECT COUNT(*) FROM public.type_conteneur;  -- 4 types
SELECT COUNT(*) FROM public.chauffeur;       -- 14 chauffeurs
SELECT COUNT(*) FROM public.vehicule;        -- 10 véhicules
SELECT COUNT(*) FROM public.sous_traitant;   -- 4 sous-traitants

-- Vérifier la distribution des statuts chauffeurs
SELECT * FROM public.chauffeur_status_stats;

-- Vérifier les RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier les triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## Fichiers de migration

| Fichier                                                 | Description                                          |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `20250118000001_create_initial_schema.sql`              | Crée les 8 tables principales + indexes + triggers   |
| `20250118000002_create_profiles_and_auth.sql`           | Table profiles + fonctions d'auth + helpers          |
| `20250118000003_create_rls_policies.sql`                | Policies RLS pour les 4 rôles                        |
| `20250118000004_seed_data.sql`                          | Données initiales (localités, conteneurs, test data) |
| `20250118000005_seed_test_users.sql`                    | Fonction pour créer les profiles de test             |
| `20251216161456_create_chauffeur_status_stats_view.sql` | Vue pour stats chauffeurs par statut                 |
| `20251216170714_grant_service_role_permissions.sql`     | Permissions service_role pour seeding                |

## Fichiers de seeding

| Fichier                 | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `seed.sql`              | Distribution des statuts chauffeurs (exécuté par `supabase db reset`) |
| `scripts/seed-users.ts` | Création utilisateurs via Admin API (exécuter manuellement)           |

## Dépannage

### Erreur: "relation already exists"

- Certaines tables existent déjà. Utilisez `supabase db reset` pour repartir de zéro.

### Erreur: "permission denied"

- Vérifiez que vous êtes connecté en tant qu'admin sur le dashboard.
- Pour le script de seed, vérifiez que la migration `grant_service_role_permissions` est appliquée.

### Erreur: "User already exists"

- Normal si vous relancez `seed-users.ts`. Le script skip les utilisateurs existants.
- Pour recréer tous les utilisateurs, faites d'abord `supabase db reset`.

### RLS empêche les queries

- Désactivez temporairement RLS pour tester : `ALTER TABLE nom_table DISABLE ROW LEVEL SECURITY;`
- Réactivez ensuite : `ALTER TABLE nom_table ENABLE ROW LEVEL SECURITY;`

### Types TypeScript vides

- Les types auto-générés ne fonctionneront qu'après application des migrations.
- Utilisez `lib/supabase/types.ts` comme référence en attendant.

## Prochaines étapes

Après avoir appliqué toutes les migrations :

1. Testez la connexion depuis l'application Next.js
2. Essayez de vous connecter avec les utilisateurs de test
3. Vérifiez que les RLS policies fonctionnent correctement
4. Générez les types TypeScript depuis le schéma appliqué

## Support

Pour toute question sur les migrations :

- Consultez la documentation Supabase : https://supabase.com/docs
- Vérifiez les logs dans le dashboard Supabase
- Référez-vous au fichier `PLAN_DEVELOPPEMENT.md` pour la stratégie de migration
