# Structure du Projet - Transport Manager

**Date** : 2025-10-18
**Phase** : Phase 0 complétée

---

## 📁 Arborescence complète

```
fuel-management/
├── .claude/                    # Configuration Claude (non versionné)
├── .husky/                     # Git hooks
│   └── pre-commit             # Validation TypeScript + ESLint
│
├── .vscode/                    # Configuration VS Code
│
├── app/                        # Next.js App Router
│   ├── (auth)/                # Routes authentification
│   │   ├── login/             # Page connexion
│   │   ├── register/          # Page inscription
│   │   └── README.md          # Documentation auth
│   │
│   ├── (dashboard)/           # Routes dashboard protégées
│   │   ├── chauffeurs/        # Gestion chauffeurs (Phase 4)
│   │   ├── rapports/          # Rapports et exports (Phase 6)
│   │   ├── sous-traitance/    # Gestion sous-traitants (Phase 5)
│   │   ├── trajets/           # Gestion trajets (Phase 3)
│   │   ├── vehicules/         # Gestion véhicules (Phase 4)
│   │   └── README.md          # Documentation dashboard
│   │
│   ├── api/                   # API Routes
│   │   └── README.md          # Documentation API (Phase 6)
│   │
│   ├── globals.css            # Styles globaux Tailwind
│   ├── layout.tsx             # Layout principal avec metadata PWA
│   └── page.tsx               # Page d'accueil
│
├── components/                 # Composants React
│   └── ui/                    # Composants Shadcn UI
│       ├── button.tsx
│       └── ...                # Autres composants UI
│
├── docs/                       # Documentation projet
│   ├── PHASE0_COMPLETE.md     # Récapitulatif Phase 0
│   ├── PROJECT_STRUCTURE.md   # Ce fichier
│   └── QUALITY_CHECKS.md      # Documentation qualité code
│
├── hooks/                      # Custom React hooks
│   └── README.md              # Documentation hooks (Phases 2-5)
│
├── lib/                        # Utilitaires et configuration
│   ├── supabase/              # Configuration Supabase
│   │   ├── client.ts          # Client browser
│   │   ├── server.ts          # Client server
│   │   └── queries.ts         # Queries DB (Phase 1)
│   └── utils.ts               # Utilitaires généraux
│
├── public/                     # Assets statiques
│   ├── icons/                 # Icônes PWA
│   │   └── README.md          # Guide icônes
│   ├── manifest.json          # Manifest PWA
│   └── sw.js                  # Service Worker (auto-généré, gitignored)
│
├── supabase/                   # Configuration Supabase
│   └── migrations/            # Migrations SQL
│       └── README.md          # Documentation migrations (Phase 1)
│
├── .env.local                  # Variables environnement (gitignored)
├── .env.example               # Template variables environnement
├── .eslintrc.json             # Configuration ESLint
├── .gitignore                 # Fichiers ignorés par git
├── .prettierrc                # Configuration Prettier
├── CLAUDE.md                  # Guide Claude Code
├── next.config.ts             # Configuration Next.js + PWA
├── package.json               # Dépendances npm
├── pnpm-lock.yaml             # Lock file pnpm
├── PLAN_DEVELOPPEMENT.md      # Plan développement
├── postcss.config.mjs         # Configuration PostCSS
├── tailwind.config.ts         # Configuration Tailwind
└── tsconfig.json              # Configuration TypeScript
```

---

## 📊 Statistiques

### Fichiers et dossiers
- **Total dossiers** : 24
- **Fichiers de configuration** : 15
- **Fichiers documentation** : 10
- **Fichiers source** : 8

### Dépendances installées
- **Dependencies** : 15 packages
- **DevDependencies** : 6 packages
- **Total** : 21 packages (+ ~700 packages avec dépendances transitives)

---

## 🎯 Routes configurées

### Routes publiques
- `/` - Page d'accueil

### Routes authentification (Phase 1)
- `/login` - Connexion utilisateur
- `/register` - Inscription (admin seulement)

### Routes dashboard protégées (Phases 2-6)
- `/` - Dashboard principal avec KPIs
- `/trajets` - Gestion des trajets
- `/chauffeurs` - Gestion des chauffeurs
- `/vehicules` - Gestion de la flotte
- `/sous-traitance` - Gestion sous-traitants
- `/rapports` - Rapports et exports

### API Routes (Phase 6)
- `/api/export-pdf` - Génération PDF
- `/api/generate-report` - Génération rapports

---

## 🔧 Configuration technique

### TypeScript
- **Strict mode** : Activé (12 options)
- **Paths aliases** : Configurés
  - `@/components/*` → `components/*`
  - `@/lib/*` → `lib/*`
  - `@/utils` → `lib/utils`
  - `@/ui/*` → `components/ui/*`
  - `@/hooks/*` → `hooks/*`

### ESLint
- **Preset** : Next.js
- **Plugins** : TypeScript, React
- **Règles** : Strict

### Prettier
- **Semi** : true
- **Single Quote** : false
- **Tab Width** : 2

### Git Hooks (Husky)
- **pre-commit** : lint-staged
  - TypeScript type-check
  - ESLint
  - Prettier

### PWA
- **Library** : @ducanh2912/next-pwa
- **Manifest** : `/public/manifest.json`
- **Service Worker** : Auto-généré
- **Mode** : Désactivé en dev, actif en prod

---

## 📦 Stack technique complète

### Framework et Core
- **Next.js** : 15.5.6 (App Router + Turbopack)
- **React** : 19.1.0 (Server Components)
- **TypeScript** : 5.x (strict mode)
- **Node.js** : ≥18.x

### Base de données
- **Supabase** : PostgreSQL cloud
- **@supabase/ssr** : 0.7.0
- **@supabase/supabase-js** : 2.75.1

### UI et Styles
- **Tailwind CSS** : v4
- **Shadcn UI** : New York style
- **Radix UI** : Primitives
- **Lucide React** : Icons
- **CSS Variables** : Thèmes customisables

### State Management
- **Zustand** : 5.0.8 (state global)
- **Nuqs** : 2.7.2 (state URL)

### Formulaires et Validation
- **React Hook Form** : 7.65.0
- **Zod** : 4.1.12 (schémas validation)
- **@hookform/resolvers** : 5.2.2
- **Next Safe Action** : 8.0.11 (server actions)

### Utilitaires
- **date-fns** : 4.1.0 (dates)
- **recharts** : 3.3.0 (graphiques)
- **jspdf** : 3.0.3 (export PDF)
- **xlsx** : 0.18.5 (export Excel)

### PWA et Performance
- **@ducanh2912/next-pwa** : 10.2.9
- **webpack** : 5.102.1

### Développement
- **pnpm** : 10.18.3 (package manager)
- **Husky** : Git hooks
- **lint-staged** : Pre-commit checks
- **Prettier** : Formatage code
- **ESLint** : Linting

---

## 🚀 Commandes disponibles

```bash
# Développement
pnpm dev              # Serveur dev avec Turbopack

# Production
pnpm build            # Build production
pnpm start            # Serveur production

# Qualité
pnpm lint             # ESLint
pnpm tsc --noEmit     # TypeScript check

# Installation
pnpm install          # Installer dépendances
```

---

## 📝 Documentation disponible

### Fichiers principaux
- `CLAUDE.md` - Guide pour Claude Code
- `PLAN_DEVELOPPEMENT.md` - Plan complet développement
- `docs/PHASE0_COMPLETE.md` - Récapitulatif Phase 0
- `docs/QUALITY_CHECKS.md` - Documentation qualité

### Documentation par dossier
- `app/(auth)/README.md` - Routes authentification
- `app/(dashboard)/README.md` - Routes dashboard
- `app/api/README.md` - API routes
- `hooks/README.md` - Custom hooks
- `supabase/migrations/README.md` - Migrations DB
- `public/icons/README.md` - Icônes PWA

### Fichiers techniques
- `carburant_db_schema.mermaid` - Schéma ERD
- `sql_queries_analysis.sql` - Queries SQL référence
- `architecture_technique.md` - Architecture détaillée
- `project_description.md` - Description projet

---

## ✅ État actuel

**Phase 0** : ✅ 100% Complétée
**Progression globale** : 10%
**Prochaine phase** : Phase 1 - Base de données et authentification

### Prêt pour Phase 1
- ✅ Infrastructure technique complète
- ✅ Configuration Supabase opérationnelle
- ✅ Structure de dossiers organisée
- ✅ PWA configuration de base
- ✅ Toutes dépendances installées
- ✅ Documentation complète
- ✅ Qualité code validée (0 erreur)

---

**Dernière mise à jour** : 2025-10-18
**Auteur** : Claude Code
