/**
 * Table des trajets avec tri, pagination et actions
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Pencil, Trash2, MoreVertical, TruckIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/use-user-role";
import { TrajetAlertBadge } from "./trajet-alert-badge";
import { TrajetDeleteDialog } from "./trajet-delete-dialog";
import { TrajetRetourDialog } from "./trajet-retour-dialog";
import { TrajetEditDialogTrigger } from "./trajet-edit-dialog-trigger";

// Type pour les trajets dans le tableau
export interface TrajetListItem {
  id: string;
  numero_trajet: string;
  date_trajet: string;
  km_debut: number;
  km_fin: number;
  parcours_total?: number | null;
  litrage_prevu?: number | null;
  litrage_station?: number | null;
  ecart_litrage?: number | null;
  consommation_au_100?: number | null;
  prix_litre?: number | null;
  statut: string | null;
  chauffeur?: {
    id: string;
    nom: string;
    prenom: string;
  } | null;
  vehicule?: {
    id: string;
    immatriculation: string;
    marque?: string | null;
    modele?: string | null;
    type_carburant?: string | null;
  } | null;
  localite_depart?: {
    id: string;
    nom: string;
    region?: string | null;
  } | null;
  localite_arrivee?: {
    id: string;
    nom: string;
    region?: string | null;
  } | null;
}

interface TrajetTableProps {
  trajets: TrajetListItem[];
  loading?: boolean;
}

export function TrajetTable({ trajets, loading }: TrajetTableProps) {
  const router = useRouter();
  const [trajetToDelete, setTrajetToDelete] = useState<string | null>(null);
  const [trajetRetourOpen, setTrajetRetourOpen] = useState<string | null>(null);
  const [trajetEditOpen, setTrajetEditOpen] = useState<string | null>(null);
  const { canEditTrips, canDeleteTrips, canRegisterReturn, loading: roleLoading } = useUserRole();

  const handleRetourSuccess = () => {
    router.refresh();
  };

  // Vérifier si le retour peut être enregistré pour un trajet
  const canShowRetour = (trajet: TrajetListItem) => {
    return canRegisterReturn && trajet.statut === "en_cours" && (!trajet.km_fin || trajet.km_fin === 0);
  };

  const getStatutBadge = (statut: string | null) => {
    if (!statut) return <Badge variant="outline">Inconnu</Badge>;

    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      en_cours: "secondary",
      termine: "default",
      annule: "destructive",
    };

    const labels: Record<string, string> = {
      en_cours: "En cours",
      termine: "Terminé",
      annule: "Annulé",
    };

    return (
      <Badge variant={variants[statut] || "default"}>
        {labels[statut] || statut}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Trajet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Véhicule</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Carburant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={9} className="h-16 text-center">
                  <div className="animate-pulse">Chargement...</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (trajets.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Aucun trajet trouvé</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Trajet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Véhicule</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Carburant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trajets.map((trajet) => (
              <TableRow key={trajet.id}>
                <TableCell>
                  <span className="font-mono text-sm font-medium">{trajet.numero_trajet}</span>
                </TableCell>
                <TableCell>
                  {format(new Date(trajet.date_trajet), "dd MMM yyyy", { locale: fr })}
                </TableCell>
                <TableCell>
                  {trajet.chauffeur
                    ? `${trajet.chauffeur.prenom} ${trajet.chauffeur.nom}`
                    : "-"}
                </TableCell>
                <TableCell>
                  {trajet.vehicule
                    ? `${trajet.vehicule.immatriculation}`
                    : "-"}
                  {trajet.vehicule?.marque && (
                    <div className="text-xs text-muted-foreground">
                      {trajet.vehicule.marque} {trajet.vehicule.modele}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <div className="text-sm">
                      {trajet.localite_depart?.nom} → {trajet.localite_arrivee?.nom}
                    </div>
                    {trajet.localite_arrivee?.region && (
                      <div className="text-xs text-muted-foreground">
                        {trajet.localite_arrivee.region}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {trajet.parcours_total} km
                </TableCell>
                <TableCell className="text-right">
                  <div>{trajet.litrage_station || "-"} L</div>
                  {trajet.consommation_au_100 && (
                    <div className="text-xs text-muted-foreground">
                      {trajet.consommation_au_100.toFixed(1)} L/100km
                    </div>
                  )}
                  <TrajetAlertBadge
                    trajet={{
                      ecart_litrage: trajet.ecart_litrage ?? null,
                      consommation_au_100: trajet.consommation_au_100 ?? null,
                      litrage_station: trajet.litrage_station ?? null,
                      prix_litre: trajet.prix_litre ?? null,
                    }}
                  />
                </TableCell>
                <TableCell>{getStatutBadge(trajet.statut)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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

                      {canShowRetour(trajet) && !roleLoading && (
                        <DropdownMenuItem
                          onClick={() => setTrajetRetourOpen(trajet.id)}
                        >
                          <TruckIcon className="mr-2 h-4 w-4" />
                          Enregistrer le retour
                        </DropdownMenuItem>
                      )}

                      {canEditTrips && !roleLoading && (
                        <DropdownMenuItem
                          onClick={() => setTrajetEditOpen(trajet.id)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                      )}

                      {canDeleteTrips && !roleLoading && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setTrajetToDelete(trajet.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de retour */}
      {trajetRetourOpen && (() => {
        const trajet = trajets.find(t => t.id === trajetRetourOpen);
        if (!trajet) return null;
        return (
          <TrajetRetourDialog
            trajetId={trajet.id}
            kmDebut={trajet.km_debut}
            litragePrevu={trajet.litrage_prevu}
            onSuccess={handleRetourSuccess}
            open={true}
            onOpenChange={(open) => !open && setTrajetRetourOpen(null)}
          />
        );
      })()}

      <TrajetDeleteDialog
        trajetId={trajetToDelete}
        open={trajetToDelete !== null}
        onOpenChange={(open) => !open && setTrajetToDelete(null)}
      />

      {trajetEditOpen && (
        <TrajetEditDialogTrigger
          trajetId={trajetEditOpen}
          open={true}
          onOpenChange={(open) => !open && setTrajetEditOpen(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}
