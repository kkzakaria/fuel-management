/**
 * Table simplifiée pour tablette (768px-1024px)
 * 5 colonnes : Date, Chauffeur, Véhicule, Trajet, Statut
 */

"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrajetListItem } from "./trajet-table";

interface TrajetTabletTableProps {
  trajets: TrajetListItem[];
  loading?: boolean;
}

export function TrajetTabletTable({ trajets, loading }: TrajetTabletTableProps) {
  const router = useRouter();

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

  const handleRowClick = (trajetId: string) => {
    router.push(`/trajets/${trajetId}`);
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Véhicule</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5} className="h-16">
                  <Skeleton className="h-4 w-full" />
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Chauffeur</TableHead>
            <TableHead>Véhicule</TableHead>
            <TableHead>Trajet</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trajets.map((trajet) => (
            <TableRow
              key={trajet.id}
              onClick={() => handleRowClick(trajet.id)}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
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
                  <div className="text-sm truncate">
                    {trajet.localite_depart?.nom} → {trajet.localite_arrivee?.nom}
                  </div>
                  {trajet.localite_arrivee?.region && (
                    <div className="text-xs text-muted-foreground truncate">
                      {trajet.localite_arrivee.region}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{getStatutBadge(trajet.statut)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
