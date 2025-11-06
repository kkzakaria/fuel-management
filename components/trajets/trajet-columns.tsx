"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react"
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

import { TrajetAlertBadge } from "./trajet-alert-badge"
import { TrajetDeleteDialog } from "./trajet-delete-dialog"

// Type pour les trajets dans le tableau
export interface TrajetListItem {
  id: string
  numero_trajet: string
  date_trajet: string
  km_debut: number
  km_fin: number
  parcours_total?: number | null
  litrage_prevu?: number | null
  litrage_station?: number | null
  ecart_litrage?: number | null
  consommation_au_100?: number | null
  prix_litre?: number | null
  statut: string | null
  chauffeur?: {
    id: string
    nom: string
    prenom: string
  } | null
  vehicule?: {
    id: string
    immatriculation: string
    marque?: string | null
    modele?: string | null
    type_carburant?: string | null
  } | null
  localite_depart?: {
    id: string
    nom: string
    region?: string | null
  } | null
  localite_arrivee?: {
    id: string
    nom: string
    region?: string | null
  } | null
}

function getStatutBadge(statut: string | null) {
  if (!statut) return <StatusBadge variant="outline">Inconnu</StatusBadge>

  const variantMap: Record<string, "success" | "info" | "destructive"> = {
    en_cours: "info",
    termine: "success",
    annule: "destructive",
  }

  const labels: Record<string, string> = {
    en_cours: "En cours",
    termine: "Terminé",
    annule: "Annulé",
  }

  return (
    <StatusBadge variant={variantMap[statut] || "secondary"}>
      {labels[statut] || statut}
    </StatusBadge>
  )
}

/**
 * Composant d'actions de ligne avec dialog de suppression
 */
function TrajetRowActions({ trajet }: { trajet: TrajetListItem }) {
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
              <Link href={`/trajets/${trajet.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/trajets/${trajet.id}/modifier`}>
                <Pencil className="mr-2 h-4 w-4" />
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

      <TrajetDeleteDialog
        trajetId={trajet.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}

/**
 * Définitions des colonnes pour le DataTable des trajets
 */
export const trajetColumns: ColumnDef<TrajetListItem>[] = [
  {
    accessorKey: "numero_trajet",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Trajet" />
    ),
    cell: ({ row }) => {
      const numero = row.getValue("numero_trajet") as string
      return <div className="font-mono text-sm font-medium">{numero}</div>
    },
    size: 140,
  },
  {
    accessorKey: "date_trajet",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date_trajet"))
      return format(date, "dd MMM yyyy", { locale: fr })
    },
    size: 120,
  },
  {
    accessorKey: "chauffeur",
    header: "Chauffeur",
    cell: ({ row }) => {
      const chauffeur = row.original.chauffeur
      return chauffeur ? `${chauffeur.prenom} ${chauffeur.nom}` : "-"
    },
    size: 180,
    enableSorting: false,
  },
  {
    accessorKey: "vehicule",
    header: "Véhicule",
    cell: ({ row }) => {
      const vehicule = row.original.vehicule
      if (!vehicule) return "-"

      return (
        <div>
          <div>{vehicule.immatriculation}</div>
          {vehicule.marque && (
            <div className="text-xs text-muted-foreground">
              {vehicule.marque} {vehicule.modele}
            </div>
          )}
        </div>
      )
    },
    size: 180,
    enableSorting: false,
  },
  {
    id: "trajet",
    header: "Trajet",
    cell: ({ row }) => {
      const depart = row.original.localite_depart
      const arrivee = row.original.localite_arrivee

      return (
        <div className="max-w-[200px]">
          <div className="text-sm">
            {depart?.nom} → {arrivee?.nom}
          </div>
          {arrivee?.region && (
            <div className="text-xs text-muted-foreground">
              {arrivee.region}
            </div>
          )}
        </div>
      )
    },
    size: 200,
    enableSorting: false,
  },
  {
    accessorKey: "parcours_total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Distance" />
    ),
    cell: ({ row }) => {
      const distance = row.getValue("parcours_total") as number | null
      return <div className="text-right">{distance} km</div>
    },
    size: 120,
  },
  {
    id: "carburant",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Carburant" />
    ),
    cell: ({ row }) => {
      const litrage = row.original.litrage_station
      const consommation = row.original.consommation_au_100

      return (
        <div className="text-right">
          <div>{litrage || "-"} L</div>
          {consommation && (
            <div className="text-xs text-muted-foreground">
              {consommation.toFixed(1)} L/100km
            </div>
          )}
          <TrajetAlertBadge
            trajet={{
              ecart_litrage: row.original.ecart_litrage ?? null,
              consommation_au_100: row.original.consommation_au_100 ?? null,
              litrage_station: row.original.litrage_station ?? null,
              prix_litre: row.original.prix_litre ?? null,
            }}
          />
        </div>
      )
    },
    size: 150,
    enableSorting: false,
  },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ row }) => getStatutBadge(row.getValue("statut")),
    size: 120,
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TrajetRowActions trajet={row.original} />,
    size: 60,
    enableSorting: false,
    enableHiding: false,
  },
]
