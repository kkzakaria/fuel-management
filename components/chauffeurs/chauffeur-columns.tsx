"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Edit, Eye, MoreVertical, Trash2, Truck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { DataTableColumnHeader } from "@/components/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Chauffeur } from "@/lib/supabase/types"
import type { StatusVariant } from "@/components/ui/status-badge"

import { ChauffeurDeleteDialog } from "./chauffeur-delete-dialog"

// Configuration des statuts chauffeur
const STATUT_CONFIG: Record<string, { label: string; variant: StatusVariant }> = {
  actif: { label: "Disponible", variant: "success" },
  en_voyage: { label: "En voyage", variant: "info" },
  en_conge: { label: "En congé", variant: "warning" },
  suspendu: { label: "Suspendu", variant: "destructive" },
  inactif: { label: "Inactif", variant: "secondary" },
}

/**
 * Fonction de filtrage personnalisée pour rechercher dans prénom ET nom
 */
function nomCompletFilterFn(
  row: Row<Chauffeur>,
  _columnId: string,
  filterValue: string
) {
  const prenom = row.original.prenom?.toLowerCase() || ""
  const nom = row.original.nom?.toLowerCase() || ""
  const search = filterValue.toLowerCase()

  return prenom.includes(search) || nom.includes(search)
}

/**
 * Composant d'actions de ligne avec dialog de suppression
 */
function ChauffeurRowActions({ chauffeur }: { chauffeur: Chauffeur }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shadow-none">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/chauffeurs/${chauffeur.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/chauffeurs/${chauffeur.id}/modifier`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </DropdownMenuItem>
            {chauffeur.statut === "actif" && (
              <DropdownMenuItem asChild>
                <Link href={`/trajets/nouveau?chauffeurId=${chauffeur.id}`}>
                  <Truck className="mr-2 h-4 w-4" />
                  Créer un trajet
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChauffeurDeleteDialog
        chauffeur={chauffeur}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}

/**
 * Définitions des colonnes pour le DataTable des chauffeurs
 */
export const chauffeurColumns: ColumnDef<Chauffeur>[] = [
  {
    accessorKey: "nom",
    id: "nom_complet",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom complet" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.original.prenom} {row.original.nom}
        </div>
      )
    },
    filterFn: nomCompletFilterFn,
    size: 200,
  },
  {
    accessorKey: "telephone",
    header: "Téléphone",
    cell: ({ row }) => {
      const telephone = row.getValue("telephone") as string | null
      return telephone || <span className="text-muted-foreground">-</span>
    },
    size: 150,
    enableSorting: false,
  },
  {
    accessorKey: "numero_permis",
    header: "N° Permis",
    cell: ({ row }) => {
      const numeroPermis = row.getValue("numero_permis") as string | null
      return numeroPermis || <span className="text-muted-foreground">-</span>
    },
    size: 150,
    enableSorting: false,
  },
  {
    accessorKey: "date_embauche",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date embauche" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("date_embauche") as string | null
      if (!date) return <span className="text-muted-foreground">-</span>

      return format(new Date(date), "dd MMM yyyy", { locale: fr })
    },
    size: 150,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const statut = row.getValue("statut") as string
      const config = STATUT_CONFIG[statut] || { label: statut, variant: "secondary" as StatusVariant }

      return (
        <StatusBadge variant={config.variant}>
          {config.label}
        </StatusBadge>
      )
    },
    size: 120,
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ChauffeurRowActions chauffeur={row.original} />,
    size: 60,
    enableSorting: false,
    enableHiding: false,
  },
]
