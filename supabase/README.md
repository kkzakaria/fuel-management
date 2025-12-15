# Supabase Database Setup

Instructions pour appliquer les migrations à votre projet Supabase.

## Prérequis

- Compte Supabase avec projet créé
- Accès au dashboard Supabase: https://czuwfjzyhfljpscqtfrp.supabase.co

## Étapes d'application des migrations

### Option 1: Via le Dashboard Supabase (Recommandé)

1. **Accédez au SQL Editor**:
   - Allez sur https://czuwfjzyhfljpscqtfrp.supabase.co/project/czuwfjzyhfljpscqtfrp/sql/new
   - Ou depuis le dashboard: SQL Editor → New query

2. **Appliquez les migrations dans l'ordre**:

   #### Migration 1: Schema initial (8 tables principales)

   ```bash
   # Copiez le contenu de: supabase/migrations/20250118000001_create_initial_schema.sql
   # Collez dans l'éditeur SQL et exécutez
   ```

   #### Migration 2: Profiles et authentification

   ```bash
   # Copiez le contenu de: supabase/migrations/20250118000002_create_profiles_and_auth.sql
   # Collez dans l'éditeur SQL et exécutez
   ```

   #### Migration 3: RLS Policies

   ```bash
   # Copiez le contenu de: supabase/migrations/20250118000003_create_rls_policies.sql
   # Collez dans l'éditeur SQL et exécutez
   ```

   #### Migration 4: Seed data

   ```bash
   # Copiez le contenu de: supabase/migrations/20250118000004_seed_data.sql
   # Collez dans l'éditeur SQL et exécutez
   ```

   #### Migration 5: Test users (optionnel)

   ```bash
   # Copiez le contenu de: supabase/migrations/20250118000005_seed_test_users.sql
   # Collez dans l'éditeur SQL et exécutez
   ```

3. **Vérifiez l'application**:
   - Allez dans Table Editor pour voir les 8 tables créées
   - Vérifiez que les données de seed sont présentes
   - Testez les RLS policies dans Authentication → Policies

### Option 2: Via Supabase CLI (Avancé)

```bash
# Installez la CLI Supabase
npm install -g supabase

# Liez votre projet
supabase link --project-ref czuwfjzyhfljpscqtfrp

# Appliquez les migrations
supabase db push

# Générez les types TypeScript
supabase gen types typescript --local > lib/supabase/database.types.ts
```

## Création des utilisateurs de test

### Option 1: Via le script automatique (Recommandé pour local)

```bash
# 1. Démarrer Supabase local
supabase start

# 2. Appliquer les migrations et seed data
supabase db reset

# 3. Créer les utilisateurs de test
pnpm seed:users
```

Le script `seed:users` va:

- Supprimer les utilisateurs de test existants (identifiés par @transport.ci)
- Créer les 5 utilisateurs avec leurs rôles
- Lier les chauffeurs à leurs profils si disponibles
- Afficher un résumé avec les identifiants

### Option 2: Via le Dashboard (Production)

1. **Créez les utilisateurs dans le Dashboard**:
   - Allez sur: Authentication → Users → Add user

2. **Créez les 5 utilisateurs de test**:

   | Email                     | Mot de passe  | Rôle à assigner |
   | ------------------------- | ------------- | --------------- |
   | admin@transport.ci        | Admin123!     | admin           |
   | gestionnaire@transport.ci | Gestion123!   | gestionnaire    |
   | chauffeur1@transport.ci   | Chauffeur123! | chauffeur       |
   | chauffeur2@transport.ci   | Chauffeur123! | chauffeur       |
   | personnel@transport.ci    | Personnel123! | personnel       |

3. **Exécutez la fonction de création de profiles**:

   ```sql
   SELECT public.create_test_profiles();
   ```

4. **Vérifiez les profiles**:
   ```sql
   SELECT * FROM public.profiles;
   ```

### Identifiants de connexion

| Rôle         | Email                     | Mot de passe  | Nom                   |
| ------------ | ------------------------- | ------------- | --------------------- |
| Admin        | admin@transport.ci        | Admin123!     | Système Admin         |
| Gestionnaire | gestionnaire@transport.ci | Gestion123!   | Jean-Marc Kouassi     |
| Chauffeur 1  | chauffeur1@transport.ci   | Chauffeur123! | Jean-Baptiste Kouassi |
| Chauffeur 2  | chauffeur2@transport.ci   | Chauffeur123! | Mamadou Coulibaly     |
| Personnel    | personnel@transport.ci    | Personnel123! | Christelle N'Guessan  |

## Vérification post-migration

Exécutez ces queries pour vérifier l'installation:

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Vérifier les données de seed
SELECT COUNT(*) FROM public.LOCALITE; -- Devrait retourner ~64
SELECT COUNT(*) FROM public.TYPE_CONTENEUR; -- Devrait retourner 4
SELECT COUNT(*) FROM public.CHAUFFEUR; -- Devrait retourner 8
SELECT COUNT(*) FROM public.VEHICULE; -- Devrait retourner 10
SELECT COUNT(*) FROM public.SOUS_TRAITANT; -- Devrait retourner 4

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

| Fichier                                       | Description                                          |
| --------------------------------------------- | ---------------------------------------------------- |
| `20250118000001_create_initial_schema.sql`    | Crée les 8 tables principales + indexes + triggers   |
| `20250118000002_create_profiles_and_auth.sql` | Table profiles + fonctions d'auth + helpers          |
| `20250118000003_create_rls_policies.sql`      | Policies RLS pour les 4 rôles                        |
| `20250118000004_seed_data.sql`                | Données initiales (localités, conteneurs, test data) |
| `20250118000005_seed_test_users.sql`          | Fonction pour créer les profiles de test             |

## Dépannage

### Erreur: "relation already exists"

- Certaines tables existent déjà. Supprimez-les ou utilisez `DROP TABLE IF EXISTS` avant la migration.

### Erreur: "permission denied"

- Vérifiez que vous êtes connecté en tant qu'admin sur le dashboard.

### RLS empêche les queries

- Désactivez temporairement RLS pour tester: `ALTER TABLE nom_table DISABLE ROW LEVEL SECURITY;`
- Réactivez ensuite: `ALTER TABLE nom_table ENABLE ROW LEVEL SECURITY;`

### Types TypeScript vides

- Les types auto-générés ne fonctionneront qu'après application des migrations.
- Utilisez `lib/supabase/types.ts` comme référence en attendant.

## Prochaines étapes

Après avoir appliqué toutes les migrations:

1. Testez la connexion depuis l'application Next.js
2. Essayez de vous connecter avec les utilisateurs de test
3. Vérifiez que les RLS policies fonctionnent correctement
4. Générez les types TypeScript depuis le schéma appliqué

## Support

Pour toute question sur les migrations:

- Consultez la documentation Supabase: https://supabase.com/docs
- Vérifiez les logs dans le dashboard Supabase
- Référez-vous au fichier `PLAN_DEVELOPPEMENT.md` pour la stratégie de migration
