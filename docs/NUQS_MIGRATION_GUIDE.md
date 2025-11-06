# Guide de Migration Nuqs - Pour Nouvelles Pages

Ce guide explique comment migrer une page avec filtres vers Nuqs pour bénéficier de la persistence URL automatique.

## Quand Utiliser Nuqs?

✅ **À utiliser pour**:

- Pages avec filtres de recherche
- Pages avec pagination
- Pages nécessitant des bookmarks
- États de formulaire à partager via URL

❌ **À NE PAS utiliser pour**:

- États éphémères (modales, tooltips)
- Données sensibles (tokens, passwords)
- États de formulaire temporaires

## Étape 1: Créer le Parser

Créez un fichier dans `lib/nuqs/parsers/[nom-page].ts`:

```typescript
import { parseAsInteger, parseAsString } from "nuqs";
import {
  createEnumParser,
  createUuidParser,
  createDateStringParser,
} from "../serializers";
import { searchSearchParam, paginationSearchParams } from "../hooks";

// 1. Définir les valeurs d'enum autorisées
const MA_PAGE_STATUT_VALUES = ["actif", "inactif", "archive"] as const;
export type MaPageStatut = (typeof MA_PAGE_STATUT_VALUES)[number];

// 2. Définir les paramètres URL avec leurs types
export const maPageSearchParams = {
  // Enums (statuts, types, etc.)
  statut: createEnumParser(MA_PAGE_STATUT_VALUES).withDefault(null),

  // UUIDs (IDs de relations)
  categorieId: createUuidParser().withDefault(null),

  // Dates (périodes, filtres temporels)
  dateDebut: createDateStringParser().withDefault(null),
  dateFin: createDateStringParser().withDefault(null),

  // Recherche et pagination (réutilisables)
  ...searchSearchParam,
  ...paginationSearchParams,
};

// 3. Type TypeScript pour les paramètres
export type MaPageSearchParams = typeof maPageSearchParams;

// 4. Fonction de conversion vers format API (si nécessaire)
export function maPageSearchParamsToFilters(
  params: Partial<MaPageSearchParams>
): Record<string, string | undefined> {
  const filters: Record<string, string | undefined> = {};

  // Convertir camelCase → snake_case pour l'API
  if (params.statut) filters["statut"] = params.statut;
  if (params.categorieId) filters["categorie_id"] = params.categorieId;
  if (params.dateDebut) filters["date_debut"] = params.dateDebut;
  if (params.dateFin) filters["date_fin"] = params.dateFin;
  if (params.search) filters["search"] = params.search;

  return filters;
}
```

## Étape 2: Migrer le Hook

Modifiez `hooks/use-ma-page.ts`:

### Avant (useState)

```typescript
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Filters {
  statut?: string;
  categorieId?: string;
  search?: string;
}

export function useMaPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["ma-page", filters, page],
    queryFn: () => fetchData({ filters, page }),
  });

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return { data, filters, updateFilters, page, setPage };
}
```

### Après (Nuqs)

```typescript
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import {
  maPageSearchParams,
  maPageSearchParamsToFilters,
} from "@/lib/nuqs/parsers/ma-page";

export function useMaPage() {
  // 1. Remplacer useState par useQueryStates
  const [searchParams, setSearchParams] = useQueryStates(maPageSearchParams, {
    history: "push",
    shallow: true,
  });

  // 2. Convertir en format API
  const filters = useMemo(
    () => maPageSearchParamsToFilters(searchParams),
    [searchParams]
  );

  // 3. TanStack Query utilise les nouveaux filtres
  const { data } = useQuery({
    queryKey: ["ma-page", filters, searchParams.page],
    queryFn: () => fetchData({ filters, page: searchParams.page }),
  });

  // 4. updateFilters met à jour l'URL automatiquement
  const updateFilters = (newFilters: Partial<typeof searchParams>) => {
    setSearchParams({ ...newFilters, page: 1 });
  };

  const nextPage = () => {
    if (searchParams.page < totalPages) {
      setSearchParams({ page: searchParams.page + 1 });
    }
  };

  // 5. Retourner les valeurs compatibles
  return {
    data,
    filters, // Format API (snake_case)
    updateFilters,
    page: searchParams.page,
    nextPage,
  };
}
```

## Étape 3: Mettre à Jour les Composants

### Composant de Filtres

**Aucun changement nécessaire!** Les composants utilisent `updateFilters` qui fonctionne de la même manière:

```typescript
// Avant et Après - même code
<Select
  value={filters.statut || ""}
  onValueChange={(value) => updateFilters({ statut: value })}
>
  <SelectItem value="actif">Actif</SelectItem>
  <SelectItem value="inactif">Inactif</SelectItem>
</Select>
```

### Composant de Liste

**Aucun changement nécessaire!** Le composant reçoit les données et filtres comme avant:

```typescript
export function MaPageList() {
  const { data, filters, updateFilters, page } = useMaPage();

  return (
    <div>
      <MaPageFilters filters={filters} onFilterChange={updateFilters} />
      <MaPageTable data={data} />
      <Pagination page={page} />
    </div>
  );
}
```

## Étape 4: Tester

### Test 1: Persistence URL

1. Appliquer un filtre (ex: statut = "actif")
2. Vérifier l'URL: `?statut=actif`
3. Copier l'URL
4. Ouvrir dans nouvel onglet
5. ✅ Le filtre doit être restauré automatiquement

### Test 2: Refresh

1. Appliquer plusieurs filtres
2. Rafraîchir la page (F5)
3. ✅ Tous les filtres doivent être préservés

### Test 3: Navigation

1. Appliquer des filtres
2. Naviguer vers une autre page
3. Revenir avec le bouton "Précédent"
4. ✅ Les filtres doivent être restaurés

### Test 4: Edge Cases

Testez avec des URLs manipulées:

```
# UUID invalide
?categorieId=invalid-uuid-123
✅ Doit ignorer sans crash

# Date invalide
?dateDebut=invalid-date
✅ Doit ignorer sans crash

# Enum invalide
?statut=invalid_status
✅ Doit ignorer sans crash
```

## Patterns Avancés

### Dual Mode (Mobile/Desktop)

Pour les pages avec comportements différents:

```typescript
export function useMaPage(options?: { mode?: "paginated" | "infinite" }) {
  const mode = options?.mode || "paginated";
  const [searchParams, setSearchParams] = useQueryStates(maPageSearchParams, {
    history: "push",
    shallow: true,
  });

  // Mode infinite scroll (mobile)
  const [accumulatedData, setAccumulatedData] = useState<Item[]>([]);

  useEffect(() => {
    if (mode === "infinite" && data) {
      if (searchParams.page === 1) {
        setAccumulatedData(data.items);
      } else {
        setAccumulatedData((prev) => [...prev, ...data.items]);
      }
    }
  }, [data, mode, searchParams.page]);

  return {
    data: mode === "infinite" ? accumulatedData : data?.items,
    // ...rest
  };
}
```

### Synchronisation Multi-Pages

Pour transmettre des paramètres entre pages:

```typescript
// Page 1: Formulaire
export function FormulairePage() {
  const [searchParams, setSearchParams] = useQueryStates(rapportSearchParams);

  const handleGenerate = () => {
    // Les paramètres sont déjà dans l'URL!
    router.push("/preview"); // URL préservée automatiquement
  };
}

// Page 2: Preview
export function PreviewPage() {
  const [searchParams] = useQueryStates(rapportSearchParams);

  // Tous les paramètres sont disponibles automatiquement
  const { reportType, dateFrom, dateTo } = searchParams;
}
```

## Checklist de Migration

- [ ] Créer le parser dans `lib/nuqs/parsers/[page].ts`
- [ ] Définir les enums et types TypeScript
- [ ] Implémenter la fonction de conversion `*SearchParamsToFilters`
- [ ] Remplacer `useState` par `useQueryStates` dans le hook
- [ ] Ajouter `useMemo` pour la conversion des filtres
- [ ] Mettre à jour les fonctions `updateFilters`, `nextPage`, etc.
- [ ] Vérifier que les composants fonctionnent sans changement
- [ ] Tester la persistence URL (bookmarks, refresh)
- [ ] Tester les edge cases (UUIDs, dates, enums invalides)
- [ ] Vérifier le mode mobile si applicable
- [ ] Mettre à jour les commentaires du code
- [ ] Créer un commit avec description claire

## Erreurs Courantes

### 1. Erreur: "nuqs requires an adapter"

**Cause**: `NuqsAdapter` manquant dans `app/layout.tsx`

**Solution**:

```typescript
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <NuqsAdapter>
            {children}
          </NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### 2. Erreur TypeScript: ParserBuilder Type Mismatch

**Cause**: Utilisation de `.withDefault()` dans des helpers

**Solution**: Retourner le parser brut, ajouter `.withDefault()` lors de l'utilisation:

```typescript
// ❌ Incorrect
export function createDateParser() {
  return parseAsIsoDate.withDefault(null);
}

// ✅ Correct
export function createDateParser() {
  return parseAsIsoDate;
}

// Utilisation
export const searchParams = {
  dateDebut: createDateParser().withDefault(null),
};
```

### 3. Filtres Non Persistés

**Cause**: Utilisation de `useState` local au lieu de `setSearchParams`

**Solution**: Toujours utiliser `setSearchParams` pour modifier les filtres:

```typescript
// ❌ Incorrect
const [localFilter, setLocalFilter] = useState("");
setLocalFilter(newValue); // Ne met pas à jour l'URL

// ✅ Correct
setSearchParams({ search: newValue }); // Met à jour l'URL automatiquement
```

## Ressources

- **Documentation Nuqs**: https://nuqs.dev
- **Tests Complets**: `docs/NUQS_MIGRATION_TESTS.md`
- **Exemples de Code**: Voir `hooks/use-trajets.ts`, `hooks/use-vehicules.ts`
- **Parsers Existants**: `lib/nuqs/parsers/` pour inspiration

## Support

Pour toute question sur la migration Nuqs:

1. Consulter les exemples de code existants
2. Vérifier `docs/NUQS_MIGRATION_TESTS.md` pour les cas d'usage
3. Référence CLAUDE.md section "URL State Management with Nuqs"
