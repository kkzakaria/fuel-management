# Solution de Gestion des Filtres - Page Trajets Mobile

## Contexte du Problème

### Bug Initial

Sur mobile, la page trajets affichait "Aucun trajet trouvé" alors que sur tablette et desktop les trajets s'affichaient correctement.

### Architecture Concernée

- **Mobile (< 768px)**: Mode `infinite` avec accumulation progressive des données
- **Tablette/Desktop**: Mode `paginated` avec pagination classique
- **Hook concerné**: `hooks/use-trajets.ts`
- **Fichier page**: `app/(dashboard)/trajets/page.tsx`

## Analyse Technique

### Problème 1: Réinitialisation à Chaque Render

**Symptôme**: Les trajets disparaissaient immédiatement après le chargement

**Cause racine**:

```typescript
// ❌ Code problématique (avant correction)
useEffect(() => {
  if (mode === "infinite") {
    setAccumulatedTrajets([]);
    setPage(1);
  }
}, [filters, mode]); // ⚠️ filters = {} crée une nouvelle référence à chaque render
```

L'objet `filters` créait une nouvelle référence à chaque render même avec des valeurs identiques, déclenchant le reset systématiquement.

### Problème 2: Normalisation des Filtres

**Symptôme**: Navigation détails → retour provoquait "Aucun trajet trouvé" après 3 secondes

**Cause racine**:

```typescript
// Séquence d'événements:
1. Page charge avec filters = {}
2. Composant TrajetMobileSearch initialise search = ""
3. filters devient {"search": ""} → détecté comme changement
4. Reset déclenché → accumulated trajets vidé
5. Auto-refresh TanStack Query (3s) → nouvelle requête
6. Données remplacées au lieu d'être mergées
```

### Problème 3: Gestion de Page 1

**Symptôme**: Auto-refresh remplaçait les données au lieu de les merger

**Cause racine**:

```typescript
// ❌ Code problématique (avant correction)
if (page === 1) {
  return currentPageTrajets; // Remplace tout
}
```

En mode infinite, page 1 doit merger intelligemment les nouvelles données avec les existantes, pas les remplacer.

## Solution Implémentée (PR #41)

### 1. Normalisation des Filtres

**Objectif**: Ignorer les valeurs vides (`""`, `null`, `undefined`) pour détecter uniquement les vrais changements.

```typescript
const normalizeFilters = (f: TrajetFilters) => {
  const normalized: Record<string, string | undefined> = {};
  Object.entries(f).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      normalized[key] = value;
    }
  });
  return JSON.stringify(normalized);
};
```

**Résultat**:

- `{}` normalisé → `"{}"`
- `{"search": ""}` normalisé → `"{}"`
- `{"search": "test"}` normalisé → `"{\"search\":\"test\"}"`

### 2. Tracking avec useRef

**Objectif**: Comparer les filtres normalisés entre renders sans déclencher de re-render.

```typescript
// Initialiser avec filtres normalisés vides
const prevFiltersRef = useRef<string>("{}");

useEffect(() => {
  const currentFilters = normalizeFilters(filters);

  if (
    mode === "infinite" &&
    isMounted &&
    currentFilters !== prevFiltersRef.current
  ) {
    setAccumulatedTrajets([]);
    setPage(1);
    prevFiltersRef.current = currentFilters;
  }
}, [filters, mode, isMounted]);
```

**Avantages**:

- ✅ Pas de reset au montage initial
- ✅ Pas de reset pour valeurs vides équivalentes
- ✅ Reset uniquement sur vrais changements de filtres

### 3. Merge Intelligent pour Page 1

**Objectif**: Gérer correctement les refetch auto (TanStack Query) et la navigation.

```typescript
useEffect(() => {
  if (mode === "infinite" && currentPageTrajets.length > 0) {
    setAccumulatedTrajets((prev) => {
      // Scénario 1: Premier chargement (prev.length === 0)
      if (page === 1 && prev.length === 0) {
        return currentPageTrajets;
      }

      // Scénario 2: Refetch page 1 avec données existantes
      if (page === 1) {
        const existingIds = new Set(prev.map((t) => t.id));
        const newTrajets = currentPageTrajets.filter(
          (t) => !existingIds.has(t.id)
        );
        // Ajouter les nouveaux au début, conserver les anciens
        return newTrajets.length > 0 ? [...newTrajets, ...prev] : prev;
      }

      // Scénario 3: Pages suivantes (page > 1)
      const existingIds = new Set(prev.map((t) => t.id));
      const newTrajets = currentPageTrajets.filter(
        (t) => !existingIds.has(t.id)
      );
      return [...prev, ...newTrajets];
    });
  }
}, [mode, currentPageTrajets, page]);
```

**Comportements**:

- **Premier chargement**: Initialise avec page 1
- **Auto-refresh**: Merge nouveaux trajets au début
- **Navigation retour**: Préserve les données accumulées
- **Scroll infini**: Ajoute pages suivantes à la fin

### 4. Exception ESLint Justifiée

**Règle violée**: `react-hooks/set-state-in-effect`

**Justification**:

```typescript
/* eslint-disable react-hooks/set-state-in-effect */
// ^ Exception nécessaire: Les patterns suivants requièrent setState dans useEffect:
// 1. "enabled after mount" pour activer TanStack Query APRÈS le montage
// 2. Accumulation progressive des trajets en mode infinite scroll
// 3. Reset conditionnel lors de vrais changements de filtres (pas au montage)
```

**Patterns légitimes**:

1. **Enabled after mount**: `setIsMounted(true)` active TanStack Query après montage initial
2. **Accumulation progressive**: `setAccumulatedTrajets()` construit liste infinie
3. **Reset conditionnel**: `setAccumulatedTrajets([])` uniquement sur vrais changements

## Tests de Validation

### Scénarios Testés ✅

1. **Chargement initial mobile**
   - Viewport: 375x667px
   - Résultat: Trajets affichés immédiatement
   - Durée: Stable après 5+ secondes

2. **Navigation détails → retour**
   - Action: Cliquer trajet → bouton retour
   - Résultat: Trajets préservés
   - Durée: Stable après 5+ secondes

3. **Auto-refresh TanStack Query**
   - Intervalle: 60 secondes
   - Résultat: Merge intelligent, pas de reset
   - Observation: Nouveaux trajets ajoutés au début

4. **Changement de filtres réels**
   - Action: Appliquer filtre "chauffeur_id"
   - Résultat: Reset correct, nouvelles données chargées

5. **Tablette (768px-1279px)**
   - Mode: Paginated
   - Résultat: Fonctionnement inchangé

6. **Desktop (1280px+)**
   - Mode: Paginated
   - Résultat: Fonctionnement inchangé

## Recommandations Futures

### Migration vers Nuqs (URL Search Params)

**Pourquoi Nuqs?**

- ✅ Déjà installé dans le projet (`nuqs` v2)
- ✅ URL devient source unique de vérité
- ✅ Persistence automatique via URL
- ✅ Navigation back/forward préserve filtres naturellement
- ✅ Partage de liens avec filtres appliqués
- ✅ Élimine besoin de normalisation manuelle

**Exemple d'implémentation**:

```typescript
// hooks/use-trajet-filters.ts
import { useQueryStates, parseAsString, parseAsIsoDateTime } from "nuqs";

export function useTrajetFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      chauffeur_id: parseAsString,
      vehicule_id: parseAsString,
      localite_arrivee_id: parseAsString,
      date_debut: parseAsIsoDateTime,
      date_fin: parseAsIsoDateTime,
      statut: parseAsString,
    },
    {
      history: "push",
      shallow: true,
    }
  );

  return { filters, setFilters };
}
```

**Utilisation dans le composant**:

```typescript
// app/(dashboard)/trajets/page.tsx
const { filters, setFilters } = useTrajetFilters();

// Plus besoin de normalisation manuelle
// Plus besoin de useRef pour tracking
// Navigation back/forward fonctionne automatiquement
```

**Bénéfices**:

- 🔥 ~30 lignes de code complexe supprimées
- 🚀 Meilleure UX (URLs partageables)
- 🧹 Code plus maintenable
- 🔄 Synchronisation automatique

### Stratégie de Migration

**Phase 1 (Actuelle)**: Solution stable avec normalisation manuelle

- ✅ Bugs corrigés
- ✅ Tous les scénarios validés
- ✅ Prêt pour production

**Phase 2 (Future)**: Migration vers Nuqs

- Remplacer `useState(filters)` par `useQueryStates`
- Supprimer logique de normalisation
- Supprimer `prevFiltersRef`
- Tester compatibilité avec infinite scroll

**Timeline suggérée**: Phase 8 (Optimisation) ou Phase 9 (Feedback utilisateurs)

## Résumé Technique

### Fichiers Modifiés

- `hooks/use-trajets.ts` (3 corrections majeures)

### PRs Associées

- **PR #40**: Première correction (`JSON.stringify(filters)`)
- **PR #41**: Solution complète (normalisation + merge intelligent)

### Lignes de Code Ajoutées

- Exception ESLint: 5 lignes
- Normalisation: 10 lignes
- Merge intelligent: 15 lignes
- useRef tracking: 3 lignes
- **Total**: ~33 lignes pour solution robuste

### Complexité Évitée avec Nuqs

- ~30 lignes de normalisation/tracking supprimables
- Logique de synchronisation URL automatique
- Gestion back/forward native navigateur

## Conclusion

La solution actuelle est **stable et prête pour production**. La migration vers Nuqs est recommandée pour améliorer la maintenabilité à long terme, mais n'est pas urgente car le système fonctionne correctement.

**Prochaine étape suggérée**: Documenter ce pattern pour autres pages avec filtres (chauffeurs, véhicules, sous-traitants, rapports).
