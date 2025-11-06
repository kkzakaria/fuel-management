/**
 * Composant d'affichage des détails d'un trajet
 * Affiche toutes les informations, calculs, et alertes
 */

"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User,
  Truck,
  MapPin,
  Fuel,
  DollarSign,
  Package,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrajetAlertBadge } from "./trajet-alert-badge";

// Type complet pour les détails d'un trajet avec toutes les relations
interface TrajetDetails {
  id: string;
  numero_trajet: string;
  date_trajet: string;
  km_debut: number;
  km_fin: number;
  parcours_total?: number | null;
  litrage_prevu: number | null;
  litrage_station: number | null;
  ecart_litrage: number | null;
  prix_litre: number | null;
  consommation_au_100: number | null;
  frais_peage: number | null;
  autres_frais: number | null;
  statut: string | null;
  observations?: string | null;
  created_at?: string;
  updated_at?: string;
  chauffeur?: {
    id: string;
    nom: string;
    prenom: string;
    telephone?: string | null;
    statut: string;
  } | null;
  vehicule?: {
    id: string;
    immatriculation: string;
    marque?: string | null;
    modele?: string | null;
    type_carburant?: string | null;
    statut: string;
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
  conteneurs?: Array<{
    id: string;
    numero_conteneur?: string | null;
    quantite?: number | null;
    statut_livraison?: string | null;
    type_conteneur?: {
      id: string;
      nom: string;
      taille_pieds: number;
      description?: string | null;
    } | null;
  }> | null;
}

interface TrajetDetailsProps {
  trajet: TrajetDetails;
}

export function TrajetDetails({ trajet }: TrajetDetailsProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const montantCarburant = (trajet.litrage_station || 0) * (trajet.prix_litre || 0);
  const coutTotal = montantCarburant + (trajet.frais_peage || 0) + (trajet.autres_frais || 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="font-mono text-base px-3 py-1">
              {trajet.numero_trajet}
            </Badge>
            {getStatutBadge(trajet.statut)}
          </div>
          <h2 className="text-2xl font-bold">Détails du trajet</h2>
          <p className="text-muted-foreground">
            {format(new Date(trajet.date_trajet), "dd MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <TrajetAlertBadge trajet={trajet} />
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Chauffeur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Chauffeur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">
                {trajet.chauffeur
                  ? `${trajet.chauffeur.prenom} ${trajet.chauffeur.nom}`
                  : "Non renseigné"}
              </p>
              {trajet.chauffeur?.telephone && (
                <p className="text-sm text-muted-foreground">
                  {trajet.chauffeur.telephone}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Véhicule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4" />
              Véhicule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">
                {trajet.vehicule?.immatriculation || "Non renseigné"}
              </p>
              {trajet.vehicule?.marque && (
                <p className="text-sm text-muted-foreground">
                  {trajet.vehicule.marque} {trajet.vehicule.modele}
                </p>
              )}
              {trajet.vehicule?.type_carburant && (
                <Badge variant="outline" className="mt-1">
                  {trajet.vehicule.type_carburant}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itinéraire et kilométrage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Itinéraire et kilométrage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Départ</p>
              <p className="font-medium">
                {trajet.localite_depart?.nom || "Non renseigné"}
              </p>
              {trajet.localite_depart?.region && (
                <p className="text-sm text-muted-foreground">
                  {trajet.localite_depart.region}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arrivée</p>
              <p className="font-medium">
                {trajet.localite_arrivee?.nom || "Non renseigné"}
              </p>
              {trajet.localite_arrivee?.region && (
                <p className="text-sm text-muted-foreground">
                  {trajet.localite_arrivee.region}
                </p>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">KM Départ</p>
              <p className="text-lg font-semibold">{trajet.km_debut}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">KM Retour</p>
              <p className="text-lg font-semibold">{trajet.km_fin}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="text-lg font-semibold text-primary">
                {trajet.parcours_total} km
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carburant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Carburant et consommation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Litrage prévu</p>
              <p className="text-lg font-semibold">
                {trajet.litrage_prevu || "-"} L
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Litrage acheté</p>
              <p className="text-lg font-semibold">
                {trajet.litrage_station || "-"} L
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Écart</p>
              <p className={`text-lg font-semibold ${trajet.ecart_litrage !== null && Math.abs(trajet.ecart_litrage) > 10 ? "text-destructive" : ""}`}>
                {trajet.ecart_litrage !== null ? `${trajet.ecart_litrage.toFixed(1)} L` : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consommation</p>
              <p className="text-lg font-semibold">
                {trajet.consommation_au_100 !== null
                  ? `${trajet.consommation_au_100.toFixed(2)} L/100km`
                  : "-"}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Prix au litre</p>
              <p className="text-lg font-semibold">
                {trajet.prix_litre ? formatCurrency(trajet.prix_litre) : "-"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Montant carburant</p>
              <p className="text-lg font-semibold">
                {formatCurrency(montantCarburant)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frais et coûts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Frais et coûts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Carburant</span>
              <span className="font-medium">{formatCurrency(montantCarburant)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frais de péage</span>
              <span className="font-medium">{formatCurrency(trajet.frais_peage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Autres frais</span>
              <span className="font-medium">{formatCurrency(trajet.autres_frais)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Coût total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(coutTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteneurs */}
      {trajet.conteneurs && trajet.conteneurs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Conteneurs transportés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trajet.conteneurs?.map((c, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {c.type_conteneur?.nom || "Type inconnu"}
                      </p>
                      {c.numero_conteneur && (
                        <p className="text-sm text-muted-foreground">
                          N° {c.numero_conteneur}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Quantité: {c.quantite}
                    </span>
                    <Badge
                      variant={
                        c.statut_livraison === "livre"
                          ? "default"
                          : c.statut_livraison === "en_cours"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {c.statut_livraison === "livre"
                        ? "Livré"
                        : c.statut_livraison === "en_cours"
                          ? "En cours"
                          : "Retour"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observations */}
      {trajet.observations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{trajet.observations}</p>
          </CardContent>
        </Card>
      )}

      {/* Métadonnées */}
      {(trajet.created_at || trajet.updated_at) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              {trajet.created_at && (
                <span>
                  Créé le {format(new Date(trajet.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                </span>
              )}
              {trajet.updated_at && (
                <span>
                  Modifié le {format(new Date(trajet.updated_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
