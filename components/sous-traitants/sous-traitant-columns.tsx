"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SousTraitant } from "@/lib/supabase/sous-traitant-types"

import { SousTraitantDeleteDialog } from "./sous-traitant-delete-dialog"

/**
 * Fonction de filtrage personnalisée pour rechercher dans nom_entreprise ET contact_principal
 */
function nomEntrepriseFilterFn(
  row: Row<SousTraitant>,
  _columnId: string,
  filterValue: string
) {
  const nomEntreprise = row.original.nom_entreprise?.toLowerCase() || ""
  const contact = row.original.contact_principal?.toLowerCase() || ""
  const search = filterValue.toLowerCase()

  return nomEntreprise.includes(search) || contact.includes(search)
}

/**
 * Composant d'actions de ligne avec dialog de suppression
 */
function SousTraitantRowActions({ sousTraitant }: { sousTraitant: SousTraitant }) {
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
              <Link href={`/sous-traitance/${sousTraitant.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/sous-traitance/${sousTraitant.id}/modifier`}>
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

      <SousTraitantDeleteDialog
        sousTraitant={sousTraitant}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}

/**
 * Définitions des colonnes pour le DataTable des sous-traitants
 */
export const sousTraitantColumns: ColumnDef<SousTraitant>[] = [
  {
    accessorKey: "nom_entreprise",
    id: "nom_entreprise",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entreprise" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.original.nom_entreprise}
        </div>
      )
    },
    filterFn: nomEntrepriseFilterFn,
    size: 250,
  },
  {
    accessorKey: "contact_principal",
    header: "Contact",
    cell: ({ row }) => {
      const contact = row.getValue("contact_principal") as string | null
      return contact || <span className="text-muted-foreground">-</span>
    },
    size: 200,
    enableSorting: false,
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
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => {
      const statut = row.getValue("statut") as string | null

      const variants: Record<
        string,
        "default" | "secondary" | "destructive"
      > = {
        actif: "default",
        inactif: "secondary",
        blackliste: "destructive",
      }

      const labels: Record<string, string> = {
        actif: "Actif",
        inactif: "Inactif",
        blackliste: "Blacklisté",
      }

      const variant = statut ? variants[statut] || "secondary" : "secondary"
      const label = statut ? labels[statut] || statut : "Inactif"

      return <Badge variant={variant}>{label}</Badge>
    },
    size: 120,
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <SousTraitantRowActions sousTraitant={row.original} />,
    size: 60,
    enableSorting: false,
    enableHiding: false,
  },
]
