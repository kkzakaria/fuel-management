# Architecture Technique

## Structure du projet

NB : Cette Structure n'est pas fixe, elle sert juste de support pour démarrer.

transport-manager/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── page.tsx              # Dashboard
│   │   ├── trajets/
│   │   │   ├── page.tsx          # Liste trajets
│   │   │   ├── [id]/page.tsx    # Détail trajet
│   │   │   └── nouveau/page.tsx  # Form nouveau
│   │   ├── chauffeurs/
│   │   ├── vehicules/
│   │   ├── sous-traitance/
│   │   └── rapports/
│   ├── api/
│   │   ├── export-pdf/
│   │   └── generate-report/
│   └── layout.tsx
├── components/
│   ├── ui/                       # Shadcn components
│   ├── dashboard/
│   ├── forms/
│   └── charts/
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Client Supabase
│   │   ├── server.ts            # Server Supabase
│   │   └── queries.ts           # Requêtes DB
│   └── utils.ts
├── hooks/
│   ├── use-trajets.ts
│   ├── use-chauffeurs.ts
│   └── use-stats.ts
└── supabase/
    ├── migrations/               # Migrations SQL
    └── seed.sql                  # Données de test

## Stack technlogique

Stack Supabase + Next.js + Shadcn UI

Librairies complémentaires

- Next-pwa pour le support PWA
- Nuqs gestion de paramètre d'état dans l'URL
- Zustand gestion d'état globale
- Next Safe Action sécurité des actions serveur
- pnpm gestionnaire de packages
