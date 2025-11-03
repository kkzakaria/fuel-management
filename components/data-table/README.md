# DataTable - Composant de Tableau Réutilisable

Composant de tableau générique basé sur TanStack Table avec toutes les fonctionnalités modernes.

## Fonctionnalités

✅ **Tri** - Tri sur toutes les colonnes avec indicateurs visuels
✅ **Recherche** - Recherche multi-colonnes configurable
✅ **Filtres** - Filtres à facettes avec compteurs
✅ **Pagination** - Navigation complète (première, précédente, suivante, dernière)
✅ **Sélection** - Sélection multiple avec checkboxes
✅ **Visibilité** - Toggle de visibilité des colonnes
✅ **Loading** - État de chargement avec skeleton animé
✅ **Responsive** - Adapté mobile et desktop
✅ **Accessibilité** - Support clavier et ARIA
✅ **TypeScript** - Typé avec génériques pour toute donnée

## Installation

Les dépendances sont déjà installées dans le projet :

- `@tanstack/react-table`
- Composants Shadcn UI (Table, Button, Input, etc.)

## Utilisation de Base

```tsx
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";

// 1. Définir vos colonnes
const columns: ColumnDef<YourDataType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    size: 200,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 250,
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>,
    size: 120,
  },
];

// 2. Utiliser le composant
export default function MyPage() {
  const { data, isLoading } = useYourData();

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      searchKey="name"
      searchPlaceholder="Rechercher par nom..."
    />
  );
}
```

## Exemples d'Utilisation

### 1. Tableau Simple (Minimum)

```tsx
<DataTable columns={columns} data={data} />
```

### 2. Avec Recherche

```tsx
<DataTable
  columns={columns}
  data={data}
  searchKey="name"
  searchPlaceholder="Rechercher un chauffeur..."
/>
```

### 3. Avec Filtres à Facettes

```tsx
<DataTable
  columns={columns}
  data={data}
  filterColumns={[
    {
      key: "statut",
      label: "Statut",
      options: [
        { label: "Actif", value: "actif" },
        { label: "Inactif", value: "inactif" },
      ],
    },
    {
      key: "type_permis",
      label: "Type de permis",
      // Options auto-détectées depuis les données
    },
  ]}
/>
```

### 4. Avec État de Chargement

```tsx
const { data, isLoading } = useChauffeurs()

<DataTable
  columns={columns}
  data={data || []}
  isLoading={isLoading}
/>
```

### 5. Avec Navigation sur Clic

```tsx
import { useRouter } from "next/navigation";

export default function TrajetsList() {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={trajets}
      onRowClick={(row) => router.push(`/trajets/${row.id}`)}
    />
  );
}
```

### 6. Avec Sélection Multiple

```tsx
const [selectedRows, setSelectedRows] = useState([])

<DataTable
  columns={columns}
  data={data}
  enableSelection
  onSelectionChange={setSelectedRows}
/>

{selectedRows.length > 0 && (
  <p>{selectedRows.length} lignes sélectionnées</p>
)}
```

### 7. Avec Actions Personnalisées

```tsx
<DataTable
  columns={columns}
  data={data}
  enableSelection
  actions={(table) => (
    <>
      {table.getSelectedRowModel().rows.length > 0 && (
        <Button
          variant="outline"
          onClick={() => handleDelete(table.getSelectedRowModel().rows)}
        >
          <TrashIcon size={16} />
          Supprimer ({table.getSelectedRowModel().rows.length})
        </Button>
      )}
      <Button onClick={() => router.push("/nouveau")}>
        <PlusIcon size={16} />
        Nouveau
      </Button>
    </>
  )}
/>
```

### 8. Configuration Complète

```tsx
<DataTable
  // Données
  columns={columns}
  data={data}
  isLoading={isLoading}
  // Recherche
  searchKey="numero_bl"
  searchPlaceholder="Rechercher par N° BL..."
  // Filtres
  filterColumns={[
    { key: "statut", label: "Statut" },
    { key: "type_conteneur", label: "Type conteneur" },
  ]}
  // Pagination
  pageSize={20}
  pageSizeOptions={[10, 20, 50, 100]}
  // Interaction
  onRowClick={(row) => router.push(`/trajets/${row.id}`)}
  enableSelection={userRole === "admin"}
  onSelectionChange={setSelected}
  // UI
  enableColumnVisibility
  actions={(table) => <Button onClick={handleExport}>Exporter</Button>}
/>
```

## Définition des Colonnes

### Colonne Simple

```tsx
{
  accessorKey: "name",
  header: "Nom",
  size: 200,
}
```

### Colonne avec Tri

```tsx
import { DataTableColumnHeader } from "@/components/data-table"

{
  accessorKey: "created_at",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Date de création" />
  ),
  cell: ({ row }) => formatDate(row.getValue("created_at")),
  size: 150,
}
```

### Colonne avec Filtrage Personnalisé

```tsx
import { multiColumnFilterFn } from "@/components/data-table"

{
  accessorKey: "name",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Nom" />
  ),
  filterFn: multiColumnFilterFn, // Recherche dans plusieurs colonnes
  size: 200,
}
```

### Colonne avec Badge

```tsx
import { Badge } from "@/components/ui/badge"

{
  accessorKey: "statut",
  header: "Statut",
  cell: ({ row }) => {
    const statut = row.getValue("statut")
    return (
      <Badge variant={statut === "actif" ? "default" : "secondary"}>
        {statut}
      </Badge>
    )
  },
  size: 120,
}
```

### Colonne de Sélection

```tsx
import { Checkbox } from "@/components/ui/checkbox"

{
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Tout sélectionner"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Sélectionner la ligne"
    />
  ),
  size: 40,
  enableSorting: false,
  enableHiding: false,
}
```

### Colonne d'Actions

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { EllipsisIcon } from "lucide-react"

{
  id: "actions",
  header: () => <span className="sr-only">Actions</span>,
  cell: ({ row }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEdit(row.original)}>
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(row.original)}
          className="text-destructive"
        >
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  size: 60,
  enableSorting: false,
  enableHiding: false,
}
```

## Props du DataTable

```typescript
interface DataTableProps<TData> {
  // Requis
  columns: ColumnDef<TData, unknown>[];
  data: TData[];

  // État de chargement
  isLoading?: boolean;

  // Recherche
  searchKey?: string;
  searchPlaceholder?: string;

  // Filtres
  filterColumns?: FilterConfig[];

  // Pagination
  pageSize?: number; // Défaut: 10
  pageSizeOptions?: number[]; // Défaut: [10, 20, 50, 100]

  // Interaction
  onRowClick?: (row: TData) => void;
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;

  // UI
  enableColumnVisibility?: boolean; // Défaut: true
  actions?: (table: Table<TData>) => ReactNode;
}

interface FilterConfig {
  key: string;
  label: string;
  options?: Array<{ label: string; value: string }>;
}
```

## Fonctions de Filtrage Personnalisées

```tsx
import {
  multiColumnFilterFn,
  facetedFilterFn,
  dateRangeFilterFn,
  numberRangeFilterFn,
} from "@/components/data-table"

// Recherche multi-colonnes
{
  accessorKey: "name",
  filterFn: multiColumnFilterFn,
}

// Filtre à facettes (checkboxes)
{
  accessorKey: "status",
  filterFn: facetedFilterFn,
}

// Filtre par plage de dates
{
  accessorKey: "created_at",
  filterFn: dateRangeFilterFn,
}

// Filtre par plage numérique
{
  accessorKey: "montant",
  filterFn: numberRangeFilterFn,
}
```

## Intégration avec les Hooks Existants

### Avec useTrajets

```tsx
import { useTrajets } from "@/hooks/use-trajets";

export default function TrajetsPage() {
  const { trajets, isLoading } = useTrajets();

  return (
    <DataTable
      columns={trajetColumns}
      data={trajets}
      isLoading={isLoading}
      searchKey="numero_bl"
      searchPlaceholder="Rechercher par N° BL..."
      onRowClick={(trajet) => router.push(`/trajets/${trajet.id}`)}
    />
  );
}
```

### Avec useChauffeurs

```tsx
import { useChauffeurs } from "@/hooks/use-chauffeurs";

export default function ChauffeursPage() {
  const { chauffeurs, isLoading } = useChauffeurs();

  return (
    <DataTable
      columns={chauffeurColumns}
      data={chauffeurs}
      isLoading={isLoading}
      searchKey="nom"
      searchPlaceholder="Rechercher un chauffeur..."
      filterColumns={[
        {
          key: "statut_emploi",
          label: "Statut",
          options: [
            { label: "CDI", value: "cdi" },
            { label: "CDD", value: "cdd" },
            { label: "Temporaire", value: "temporaire" },
          ],
        },
      ]}
      onRowClick={(chauffeur) => router.push(`/chauffeurs/${chauffeur.id}`)}
    />
  );
}
```

## Bonnes Pratiques

### 1. Définir les Colonnes en Dehors du Composant

```tsx
// ✅ Bon - Pas de re-render inutile
const columns: ColumnDef<Trajet>[] = [...]

export default function Page() {
  return <DataTable columns={columns} data={data} />
}

// ❌ Mauvais - Les colonnes sont recréées à chaque render
export default function Page() {
  const columns = [...]
  return <DataTable columns={columns} data={data} />
}
```

### 2. Utiliser useMemo pour les Données Transformées

```tsx
const transformedData = useMemo(() => {
  return rawData.map(item => ({
    ...item,
    displayName: `${item.prenom} ${item.nom}`,
  }))
}, [rawData])

<DataTable columns={columns} data={transformedData} />
```

### 3. Gérer le Loading State

```tsx
// ✅ Bon - Skeleton animé
<DataTable columns={columns} data={data || []} isLoading={isLoading} />;

// ❌ Mauvais - Rien pendant le chargement
{
  !isLoading && <DataTable columns={columns} data={data} />;
}
```

### 4. Taille des Colonnes

```tsx
// Définir explicitement les tailles pour un meilleur rendu
{
  accessorKey: "numero_bl",
  header: "N° BL",
  size: 150, // Largeur fixe en pixels
}
```

### 5. Empêcher la Navigation sur Actions

Le composant gère automatiquement `stopPropagation` sur les colonnes `select` et `actions` pour éviter de déclencher `onRowClick` lors du clic sur ces éléments.

## Migration depuis un Tableau Existant

### Avant (Composant Personnalisé)

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nom</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Après (DataTable)

```tsx
const columns: ColumnDef<MyData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
]

<DataTable columns={columns} data={data} />
```

## Dépannage

### Les Filtres ne Fonctionnent Pas

Assurez-vous que les colonnes utilisent la fonction de filtrage appropriée :

```tsx
{
  accessorKey: "status",
  header: "Statut",
  filterFn: facetedFilterFn, // ← Important pour les filtres à facettes
}
```

### Le Skeleton ne s'Affiche Pas

Vérifiez que `isLoading` est bien passé en prop :

```tsx
const { data, isLoading } = useMyData()

<DataTable
  columns={columns}
  data={data || []} // ← Valeur par défaut
  isLoading={isLoading} // ← Obligatoire pour le skeleton
/>
```

### La Navigation sur Clic ne Fonctionne Pas sur Actions

C'est normal ! Le composant empêche automatiquement la navigation sur les colonnes `select` et `actions` pour éviter les comportements indésirables.

## Support

Pour toute question ou problème, consultez :

- [TanStack Table Documentation](https://tanstack.com/table)
- [Shadcn UI Components](https://ui.shadcn.com)
- Code source : `components/data-table/`
