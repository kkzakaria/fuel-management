/**
 * Composant d'affichage des détails d'un véhicule
 * Affiche les informations, trajets, statistiques et alertes avec onglets
 */

"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Truck,
  Calendar,
  Gauge,
  Fuel,
  TrendingUp,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useVehicule, useVehiculeTrajets } from "@/hooks/use-vehicule";
import { useVehiculeStats, useVehiculeAlertes } from "@/hooks/use-vehicule-stats";

// Type pour les trajets avec jointures
type TrajetWithDetails = {
  id: string;
  date_trajet: string;
  parcours_total: number;
  consommation_au_100: number | null;
  litrage_station: number | null;
  prix_litre: number | null;
  ecart_litrage: number | null;
  statut: string;
  localite_depart: { nom: string; region: string | null } | null;
  localite_arrivee: { nom: string; region: string | null } | null;
  chauffeur: { nom: string; prenom: string } | null;
};

// Type pour les alertes
type AlerteMainten = {
  type: string;
  message: string;
  severite: "info" | "warning" | "error";
};

interface VehiculeDetailsProps {
  vehiculeId: string;
}

export function VehiculeDetails({ vehiculeId }: VehiculeDetailsProps) {
  const { vehicule, loading: loadingVehicule } = useVehicule(vehiculeId);
  const { trajets, loading: loadingTrajets, count: trajetsCount } = useVehiculeTrajets(vehiculeId, 10);
  const { stats, loading: loadingStats } = useVehiculeStats(vehiculeId);
  const { alertes, loading: loadingAlertes } = useVehiculeAlertes(vehiculeId);

  if (loadingVehicule) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!vehicule) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Véhicule non trouvé</div>
      </div>
    );
  }

  const getStatutBadge = (statut: string | null) => {
    if (!statut) return <Badge variant="outline">Inconnu</Badge>;

    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      actif: "default",
      en_reparation: "secondary",
      inactif: "destructive",
    };

    const labels: Record<string, string> = {
      actif: "Actif",
      en_reparation: "En réparation",
      inactif: "Inactif",
    };

    return (
      <Badge variant={variants[statut] || "default"}>
        {labels[statut] || statut}
      </Badge>
    );
  };

  const getCarburantBadge = (carburant: string | null) => {
    if (!carburant) return null;

    const variants: Record<string, "default" | "secondary"> = {
      diesel: "default",
      essence: "secondary",
    };

    const labels: Record<string, string> = {
      diesel: "Diesel",
      essence: "Essence",
    };

    return (
      <Badge variant={variants[carburant] || "default"}>
        {labels[carburant] || carburant}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{vehicule.immatriculation}</h2>
          <p className="text-muted-foreground">
            {vehicule.marque} {vehicule.modele}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatutBadge(vehicule.statut)}
          {vehicule.type_carburant && getCarburantBadge(vehicule.type_carburant)}
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="informations" className="w-full">
        <TabsList>
          <TabsTrigger value="informations">
            <Truck className="mr-2 h-4 w-4" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="trajets">
            <MapPin className="mr-2 h-4 w-4" />
            Trajets ({trajetsCount})
          </TabsTrigger>
          <TabsTrigger value="statistiques">
            <TrendingUp className="mr-2 h-4 w-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="alertes">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alertes {alertes.length > 0 && `(${alertes.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="informations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Informations du véhicule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Immatriculation</p>
                  <p className="font-medium">{vehicule.immatriculation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <div className="mt-1">{getStatutBadge(vehicule.statut)}</div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                {vehicule.marque && (
                  <div>
                    <p className="text-sm text-muted-foreground">Marque</p>
                    <p className="font-medium">{vehicule.marque}</p>
                  </div>
                )}
                {vehicule.modele && (
                  <div>
                    <p className="text-sm text-muted-foreground">Modèle</p>
                    <p className="font-medium">{vehicule.modele}</p>
                  </div>
                )}
              </div>

              {vehicule.annee && (
                <>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Année</p>
                        <p className="font-medium">{vehicule.annee}</p>
                      </div>
                    </div>
                    {vehicule.type_carburant && (
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Type de carburant</p>
                          <div className="mt-1">{getCarburantBadge(vehicule.type_carburant)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Kilométrage actuel</p>
                  <p className="text-lg font-semibold">
                    {vehicule.kilometrage_actuel?.toLocaleString("fr-FR")} km
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Trajets */}
        <TabsContent value="trajets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Historique des trajets ({trajetsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTrajets ? (
                <div className="text-center text-muted-foreground py-8">
                  Chargement des trajets...
                </div>
              ) : trajets.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Aucun trajet enregistré
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Chauffeur</TableHead>
                      <TableHead>Itinéraire</TableHead>
                      <TableHead className="text-right">Distance</TableHead>
                      <TableHead className="text-right">Consommation</TableHead>
                      <TableHead className="text-right">Écart</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(trajets as TrajetWithDetails[]).map((trajet) => (
                      <TableRow key={trajet.id}>
                        <TableCell>
                          {trajet.date_trajet && format(new Date(trajet.date_trajet!), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {trajet.chauffeur
                            ? `${trajet.chauffeur.prenom} ${trajet.chauffeur.nom}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            {trajet.localite_depart?.nom} → {trajet.localite_arrivee?.nom}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {trajet.parcours_total ? `${trajet.parcours_total} km` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {trajet.consommation_au_100
                            ? `${trajet.consommation_au_100.toFixed(2)} L/100km`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {trajet.ecart_litrage !== null ? (
                            <span
                              className={
                                Math.abs(trajet.ecart_litrage) > 10
                                  ? "text-destructive font-medium"
                                  : ""
                              }
                            >
                              {trajet.ecart_litrage.toFixed(1)} L
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trajet.statut === "termine"
                                ? "default"
                                : trajet.statut === "en_cours"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {trajet.statut === "termine"
                              ? "Terminé"
                              : trajet.statut === "en_cours"
                                ? "En cours"
                                : "Annulé"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Statistiques */}
        <TabsContent value="statistiques" className="space-y-4">
          {loadingStats ? (
            <div className="text-center text-muted-foreground py-8">
              Chargement des statistiques...
            </div>
          ) : !stats ? (
            <div className="text-center text-muted-foreground py-8">
              Statistiques non disponibles
            </div>
          ) : (
            <>
              {/* KPIs principaux */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Trajets effectués
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.nb_trajets}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      KM parcourus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.km_parcourus.toLocaleString("fr-FR")} km
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Kilométrage actuel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.kilometrage_actuel.toLocaleString("fr-FR")} km
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Consommation moyenne
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.conso_moyenne.toFixed(2)} L/100km
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coûts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    Analyse des coûts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coût carburant total</span>
                      <span className="font-medium">
                        {formatCurrency(stats.cout_carburant_total)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coût total (avec frais)</span>
                      <span className="font-medium">{formatCurrency(stats.cout_total)}</span>
                    </div>
                    <Separator />
                    {stats.nb_trajets > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Coût moyen par trajet</span>
                          <span className="font-medium">
                            {formatCurrency(stats.cout_total / stats.nb_trajets)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Coût moyen par km</span>
                          <span className="font-medium">
                            {stats.km_parcourus > 0
                              ? formatCurrency(stats.cout_total / stats.km_parcourus)
                              : "-"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Onglet Alertes */}
        <TabsContent value="alertes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertes et maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAlertes ? (
                <div className="text-center text-muted-foreground py-8">
                  Chargement des alertes...
                </div>
              ) : alertes.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Aucune alerte</AlertTitle>
                  <AlertDescription>
                    Aucune alerte de maintenance pour ce véhicule.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {(alertes as AlerteMainten[]).map((alerte, index) => (
                    <Alert
                      key={index}
                      variant={alerte.severite === "error" ? "destructive" : "default"}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{alerte.type}</AlertTitle>
                      <AlertDescription>{alerte.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
