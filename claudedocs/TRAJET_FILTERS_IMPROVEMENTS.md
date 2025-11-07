# Améliorations du composant Trajet Filters Dropdown

**Date**: 2025-11-07
**Composants modifiés**:

- `components/trajets/trajet-filters-dropdown.tsx`
- `components/ui/combobox-with-clear.tsx` (nouveau)

## Résumé des améliorations

Le composant `TrajetFiltersDropdown` a été considérablement amélioré pour offrir une meilleure expérience utilisateur lors de la sélection des filtres.

**🎯 Amélioration majeure**: Le date range picker utilise maintenant un **calendrier unique en mode range** (inspiré de `comp-507.tsx`) au lieu de deux calendriers séparés, avec les préréglages affichés dans une colonne latérale.

## 1. Nouveau composant ComboboxWithClear

### Fichier créé

`components/ui/combobox-with-clear.tsx`

### Fonctionnalités

- **Bouton clear (×)**: Affiche un bouton pour effacer la sélection quand une valeur est sélectionnée
- **Gestion intelligente**: Le bouton clear n'apparaît que pour les valeurs autres que "all"
- **Prévention de la propagation**: Le clic sur le bouton clear ne ferme pas le dropdown
- **Icônes doubles**: ChevronsUpDown + X pour une meilleure UX

### Props principales

```typescript
interface ComboboxWithClearProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  showClear?: boolean; // Par défaut: true
  // ... autres props du Combobox standard
}
```

### Utilisation

```tsx
<ComboboxWithClear
  options={[
    { value: "all", label: "Tous les chauffeurs" },
    ...chauffeurs.map((c) => ({
      value: c.id,
      label: `${c.prenom} ${c.nom}`,
    })),
  ]}
  value={filters.chauffeur_id || "all"}
  onValueChange={(value) =>
    onFiltersChange({ chauffeurId: value === "all" ? undefined : value })
  }
/>
```

## 2. Date Range Picker unifié avec préréglages latéraux

### Architecture

Inspiré des composants templates, le nouveau date range picker combine :

- **`comp-507.tsx`** : Layout horizontal avec colonne de préréglages
- **`comp-497.tsx`** : Dropdowns pour navigation rapide mois/année

Le résultat final :

- **Un seul calendrier** en mode `range` (react-day-picker)
- **Colonne latérale** avec boutons de préréglage
- **Layout horizontal** : préréglages à gauche, calendrier à droite
- **Dropdowns mois/année** : Navigation rapide sans cliquer plusieurs fois

### Préréglages disponibles

Boutons dans la colonne latérale pour sélectionner des plages de dates courantes :

1. **Aujourd'hui**: Date du jour uniquement
2. **7 derniers jours**: Les 7 derniers jours (du jour actuel - 6 jours au jour actuel)
3. **30 derniers jours**: Les 30 derniers jours (du jour actuel - 29 jours au jour actuel)
4. **Ce mois**: Du début du mois en cours à la fin du mois en cours
5. **Mois dernier**: Du début au dernier jour du mois précédent
6. **Effacer**: Bouton pour réinitialiser les dates (apparaît seulement si des dates sont sélectionnées)

### Implémentation

```typescript
// Conversion des filtres en DateRange
const dateRange: DateRange | undefined =
  filters.date_debut || filters.date_fin
    ? {
        from: filters.date_debut ? new Date(filters.date_debut) : undefined,
        to: filters.date_fin ? new Date(filters.date_fin) : undefined,
      }
    : undefined;

// Préréglages de dates (objets DateRange)
const datePresets = {
  today: { from: startOfDay(today), to: endOfDay(today) },
  last7days: { from: startOfDay(subDays(today, 6)), to: endOfDay(today) },
  last30days: { from: startOfDay(subDays(today, 29)), to: endOfDay(today) },
  thisMonth: { from: startOfMonth(today), to: endOfMonth(today) },
  lastMonth: {
    from: startOfMonth(subDays(startOfMonth(today), 1)),
    to: endOfMonth(subDays(startOfMonth(today), 1)),
  },
};

// Gestion des changements
const handleDateRangeChange = (range: DateRange | undefined) => {
  if (!range) {
    onFiltersChange({ dateDebut: null, dateFin: null });
    return;
  }

  onFiltersChange({
    dateDebut: range.from?.toISOString() ?? null,
    dateFin: range.to?.toISOString() ?? null,
  });
};
```

### Structure visuelle

```tsx
<div className="flex">
  {/* Colonne préréglages (gauche) */}
  <div className="border-r py-3 w-36">
    <Button onClick={() => handleDatePreset("today")}>Aujourd'hui</Button>
    <Button onClick={() => handleDatePreset("last7days")}>
      7 derniers jours
    </Button>
    {/* ... autres préréglages */}
    {hasDateFilter && (
      <Button onClick={() => handleDateRangeChange(undefined)}>
        <X /> Effacer
      </Button>
    )}
  </div>

  {/* Calendrier range (droite) */}
  <Calendar
    mode="range"
    selected={dateRange}
    onSelect={handleDateRangeChange}
    numberOfMonths={1}
  />
</div>
```

### Avantages

- ✅ **UX améliorée**: Un seul calendrier, plus intuitif pour sélectionner une plage
- ✅ **Navigation ultra-rapide**: Dropdowns mois/année pour naviguer instantanément
- ✅ **Moins d'espace**: Layout compact avec préréglages latéraux
- ✅ **Feedback visuel**: Sélection de plage visible en temps réel sur le calendrier
- ✅ **Navigation simplifiée**: Pas besoin de naviguer entre deux calendriers
- ✅ **Mobile-friendly**: Layout plus adapté aux petits écrans
- ✅ **Accès large**: Années 2020-2030 accessibles via dropdown

### Navigation par dropdown

Le calendrier utilise maintenant `captionLayout="dropdown"` avec des composants personnalisés :

```tsx
<Calendar
  mode="range"
  captionLayout="dropdown"
  startMonth={new Date(2020, 0)}
  endMonth={new Date(2030, 11)}
  hideNavigation
  components={{
    DropdownNav: (props) => (
      <div className="flex w-full items-center gap-2">{props.children}</div>
    ),
    Dropdown: (props) => (
      <Select
        value={String(props.value)}
        onValueChange={(value) => {
          if (props.onChange) {
            handleCalendarChange(value, props.onChange);
          }
        }}
      >
        <SelectTrigger className="h-8 w-fit font-medium first:grow">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {props.options?.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
  }}
/>
```

**Bénéfices** :

- Navigation instantanée vers n'importe quel mois/année (2020-2030)
- Plus besoin de cliquer 12 fois pour aller à l'année précédente
- Interface familière avec les dropdowns Select de Shadcn UI

### Dépendances

- `react-day-picker`: Mode `range`, type `DateRange`, `DropdownNavProps`, `DropdownProps`
- `date-fns`: `startOfMonth`, `endOfMonth`, `subDays`, `startOfDay`, `endOfDay`
- `@/components/ui/select`: Pour les dropdowns personnalisés

## 3. Indicateurs visuels pour les filtres actifs

### Mise en œuvre

Chaque sous-menu affiche maintenant un **point bleu** (badge) quand un filtre est actif dans cette catégorie.

```tsx
<DropdownMenuSubTrigger>
  <CalendarIcon size={16} className="opacity-60" aria-hidden="true" />
  <span>Période</span>
  {hasDateFilter && (
    <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
  )}
</DropdownMenuSubTrigger>
```

### Variables de détection

```typescript
const hasDateFilter = filters.date_debut || filters.date_fin;
const hasChauffeurFilter = filters.chauffeur_id;
const hasVehiculeFilter = filters.vehicule_id;
const hasDestinationFilter = filters.localite_arrivee_id;
const hasStatutFilter = filters.statut;
```

### Apparence

- **Taille**: 2×2 (h-2 w-2)
- **Forme**: Rond (rounded-full)
- **Couleur**: Primary theme color (bg-primary)
- **Position**: Aligné à droite (ml-auto)

## 4. Organisation du layout

### Layout horizontal (préréglages + calendrier)

#### Colonne préréglages (gauche)

- Largeur fixe: `w-36` (144px)
- Bordure droite: `border-r`
- Padding vertical: `py-3`
- Boutons empilés verticalement avec `gap-1`
- Style bouton: `variant="ghost"`, `size="sm"`, `h-8`, `text-xs`
- Alignement texte: `justify-start`

#### Calendrier (droite)

- Mode: `range` (sélection de plage)
- Padding: `p-3`
- Un seul mois affiché: `numberOfMonths={1}`
- Largeur auto-calculée selon le calendrier

### Responsive design

Le layout horizontal fonctionne bien car :

- Largeur totale ≈ 450px (144px préréglages + 300px calendrier)
- S'affiche dans un `DropdownMenuSubContent` avec `w-auto`
- Mobile-friendly : assez compact pour la plupart des écrans

## 5. Remplacement global du Combobox

Tous les sous-menus utilisant Combobox ont été migrés vers ComboboxWithClear :

- ✅ **Chauffeur**: Liste des chauffeurs avec recherche + bouton clear
- ✅ **Véhicule**: Liste des véhicules avec recherche + bouton clear
- ✅ **Destination**: Liste des localités avec recherche + bouton clear
- ⚠️ **Statut**: Conserve DropdownMenuRadioGroup (3 options seulement, pas besoin de recherche)

## Bénéfices UX

### Pour l'utilisateur

1. **Calendrier unique**: Meilleure expérience avec un seul calendrier en mode range au lieu de deux séparés
2. **Sélection rapide**: Les boutons de préréglage permettent de filtrer rapidement par période courante
3. **Feedback visuel immédiat**:
   - Badges sur les sous-menus montrant les filtres actifs
   - Plage de dates visible en temps réel sur le calendrier
4. **Effacer facilement**: Boutons X pour effacer une sélection sans tout réinitialiser
5. **Navigation intuitive**: Layout horizontal avec préréglages bien visibles

### Pour le développement

1. **Composant réutilisable**: ComboboxWithClear peut être utilisé ailleurs dans l'app
2. **Code simplifié**:
   - Moins de code avec un seul calendrier au lieu de deux
   - Pas besoin de gérer la synchronisation entre deux calendriers
   - Suppression des imports Select non utilisés
3. **TypeScript strict**: Aucune erreur de compilation
4. **ESLint propre**: Code conforme aux standards du projet
5. **Pattern éprouvé**: Basé sur le template `comp-507.tsx` (design pattern reconnu)

## Tests recommandés

### Tests manuels à effectuer

1. ✅ Vérifier l'apparition du bouton X dans les Combobox quand une valeur est sélectionnée
2. ✅ Tester chaque bouton de préréglage de dates
3. ✅ Vérifier la sélection de plage directement sur le calendrier (cliquer date début puis date fin)
4. ✅ Vérifier l'apparition des badges sur les sous-menus actifs
5. ✅ Tester le bouton "Effacer" pour les dates
6. ✅ Vérifier la navigation au clavier dans les nouveaux Combobox
7. ✅ Vérifier le layout horizontal (préréglages + calendrier côte à côte)

### Tests de régression

1. ✅ Les filtres existants fonctionnent toujours correctement
2. ✅ La synchronisation avec l'URL (Nuqs) fonctionne
3. ✅ Le compteur de filtres actifs dans le bouton principal est correct
4. ✅ Le bouton "Réinitialiser les filtres" efface tout

## Compatibilité

- ✅ **TypeScript**: Aucune erreur de compilation
- ✅ **ESLint**: Aucun warning
- ✅ **React 19**: Compatible avec les Server Components
- ✅ **Shadcn UI**: Utilise les composants UI standards
- ✅ **Nuqs**: Compatible avec la gestion d'état URL existante

## Fichiers modifiés

### Nouveau fichier

```
components/ui/combobox-with-clear.tsx (134 lignes)
```

### Fichiers modifiés

```
components/trajets/trajet-filters-dropdown.tsx
- Ajout imports: ComboboxWithClear, DateRange (react-day-picker)
- Suppression imports: Select components (non utilisés)
- Refactorisation date range picker:
  * Conversion filtres → DateRange
  * handleDateRangeChange() remplace handleDateDebutChange() et handleDateFinChange()
  * Préréglages avec objets DateRange (datePresets)
- Layout horizontal: colonne préréglages (w-36) + calendrier mode="range"
- Ajout variables hasXFilter (5 lignes)
- Ajout badges indicateurs (5 endroits)
- Remplacement Combobox → ComboboxWithClear (3 endroits)
- Réduction totale: ~150 lignes supprimées (deux calendriers → un seul)
```

## Prochaines améliorations possibles

### Court terme

1. Ajouter des animations pour les badges (fade-in)
2. Ajouter un tooltip sur les badges pour expliquer le filtre actif
3. Ajouter un bouton "Appliquer" pour valider plusieurs filtres à la fois

### Moyen terme

1. Mémoriser les préréglages favoris de l'utilisateur
2. Ajouter plus de préréglages (trimestre, année, personnalisé)
3. Permettre de sauvegarder des combinaisons de filtres favorites

### Long terme

1. Ajouter des préréglages intelligents basés sur les trajets fréquents
2. Suggestions de filtres basées sur l'historique de recherche
3. Export/import de configurations de filtres
