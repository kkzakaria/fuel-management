"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react"
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
import type { Vehicule } from "@/lib/supabase/types"

import { VehiculeDeleteDialog } from "./vehicule-delete-dialog"

/**
 * Fonction de filtrage personnalisée pour rechercher dans immatriculation, marque et modèle
 */
function vehiculeFilterFn(
  row: Row<Vehicule>,
  _columnId: string,
  filterValue: string
) {
  const immatriculation = row.original.immatriculation?.toLowerCase() || ""
  const marque = row.original.marque?.toLowerCase() || ""
  const modele = row.original.modele?.toLowerCase() || ""
  const search = filterValue.toLowerCase()

  return (
    immatriculation.includes(search) ||
    marque.includes(search) ||
    modele.includes(search)
  )
}

/**
 * Composant d'actions de ligne avec dialog de suppression
 */
function VehiculeRowActions({ vehicule }: { vehicule: Vehicule }) {
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
              <Link href={`/vehicules/${vehicule.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/vehicules/${vehicule.id}/modifier`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </DropdownMenuItem>
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

      <VehiculeDeleteDialog
        vehicule={vehicule}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}

/**
 * Définitions des colonnes pour le DataTable des véhicules
 */
export const vehiculeColumns: ColumnDef<Vehicule>[] = [
  {
    accessorKey: "immatriculation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Immatriculation" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.immatriculation}</div>
    },
    filterFn: vehiculeFilterFn,
    size: 150,
  },
  {
    accessorKey: "marque",
    header: "Véhicule",
    cell: ({ row }) => {
      const marque = row.original.marque || "Marque inconnue"
      const modele = row.original.modele || ""
      const vehicule = modele ? `${marque} ${modele}` : marque
      return (
        <div className="font-medium truncate" title={vehicule}>
          {vehicule}
        </div>
      )
    },
    size: 200,
    enableSorting: false,
  },
  {
    accessorKey: "annee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Année" />
    ),
    cell: ({ row }) => {
      const annee = row.getValue("annee") as number | null
      return annee || <span className="text-muted-foreground">-</span>
    },
    size: 100,
  },
  {
    accessorKey: "type_carburant",
    header: "Carburant",
    cell: ({ row }) => {
      const typeCarburant = row.getValue("type_carburant") as string
      return (
        <StatusBadge variant="secondary" className="capitalize">
          {typeCarburant}
        </StatusBadge>
      )
    },
    size: 120,
    enableSorting: false,
  },
  {
    accessorKey: "kilometrage_actuel",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kilométrage" />
    ),
    cell: ({ row }) => {
      const km = row.getValue("kilometrage_actuel") as number
      return <span>{km?.toLocaleString("fr-FR") || 0} km</span>
    },
    size: 120,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const statut = row.getValue("statut") as string

      const variantMap: Record<
        string,
        "success" | "warning" | "secondary" | "destructive"
      > = {
        actif: "success",
        maintenance: "warning",
        inactif: "secondary",
        reforme: "destructive",
      }

      return (
        <StatusBadge variant={variantMap[statut] || "secondary"}>
          {statut}
        </StatusBadge>
      )
    },
    size: 120,
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <VehiculeRowActions vehicule={row.original} />,
    size: 60,
    enableSorting: false,
    enableHiding: false,
  },
]
