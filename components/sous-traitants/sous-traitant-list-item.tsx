/**
 * Carte sous-traitant pour affichage mobile
 */

"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SousTraitant } from "@/lib/supabase/sous-traitant-types";

interface SousTraitantListItemProps {
  sousTraitant: SousTraitant;
  onDelete?: () => void;
}

export function SousTraitantListItem({ sousTraitant }: SousTraitantListItemProps) {
  const getStatutBadge = (statut: string | null) => {
    if (statut === "actif") return <Badge variant="default">Actif</Badge>;
    if (statut === "blackliste") return <Badge variant="destructive">Blacklisté</Badge>;
    return <Badge variant="secondary">Inactif</Badge>;
  };

  return (
    <Link href={`/sous-traitance/${sousTraitant.id}`}>
      <Card className="hover:bg-muted/50 transition-colors border-b last:border-b-0 rounded-none">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{sousTraitant.nom_entreprise}</h3>
                {getStatutBadge(sousTraitant.statut)}
              </div>
              
              {sousTraitant.contact_principal && (
                <p className="text-sm text-muted-foreground">
                  {sousTraitant.contact_principal}
                </p>
              )}

              <div className="space-y-1">
                {sousTraitant.telephone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{sousTraitant.telephone}</span>
                  </div>
                )}
                {sousTraitant.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{sousTraitant.email}</span>
                  </div>
                )}
                {sousTraitant.adresse && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="line-clamp-1">{sousTraitant.adresse}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
