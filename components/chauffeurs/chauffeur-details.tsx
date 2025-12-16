/**
 * Composant d'affichage des détails d'un chauffeur
 * Affiche les informations, trajets, et statistiques avec onglets
 */

"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  Truck,
  MapPin,
  Fuel,
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
import { useChauffeur, useChauffeurTrajets } from "@/hooks/use-chauffeur";
import { useChauffeurStats } from "@/hooks/use-chauffeur-stats";

// Type pour les trajets avec jointures
type TrajetWithDetails = {
  id: string;
  date_trajet: string;
  parcours_total: number;
  consommation_au_100: number | null;
  litrage_station: number | null;
  prix_litre: number | null;
  statut: string;
  localite_depart: { nom: string; region: string | null } | null;
  localite_arrivee: { nom: string; region: string | null } | null;
  vehicule: { immatriculation: string; marque: string | null; modele: string | null } | null;
};

interface ChauffeurDetailsProps {
  chauffeurId: string;
}

export function ChauffeurDetails({ chauffeurId }: ChauffeurDetailsProps) {
  const { chauffeur, loading: loadingChauffeur } = useChauffeur(chauffeurId);
  const { trajets, loading: loadingTrajets, count: trajetsCount } = useChauffeurTrajets(chauffeurId, 10);
  const { stats, loading: loadingStats } = useChauffeurStats(chauffeurId);

  if (loadingChauffeur) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!chauffeur) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chauffeur non trouvé</div>
      </div>
    );
  }

  const getStatutBadge = (statut: string | null) => {
    if (!statut) return <Badge variant="outline">Inconnu</Badge>;

    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      actif: "default",
      inactif: "secondary",
      suspendu: "destructive",
    };

    const customStyles: Record<string, string> = {
      en_voyage: "bg-blue-600 text-white border-transparent",
      en_conge: "bg-yellow-600 text-white border-transparent",
    };

    const labels: Record<string, string> = {
      actif: "Disponible",
      en_voyage: "En voyage",
      en_conge: "En congé",
      suspendu: "Suspendu",
      inactif: "Inactif",
    };

    return (
      <Badge
        variant={variants[statut] || "default"}
        className={customStyles[statut]}
      >
        {labels[statut] || statut}
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
          <h2 className="text-2xl font-bold">
            {chauffeur.prenom} {chauffeur.nom}
          </h2>
          <p className="text-muted-foreground">Détails du chauffeur</p>
        </div>
        {getStatutBadge(chauffeur.statut)}
      </div>

      {/* Onglets */}
      <Tabs defaultValue="informations" className="w-full">
        <TabsList>
          <TabsTrigger value="informations">
            <User className="mr-2 h-4 w-4" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="trajets">
            <Truck className="mr-2 h-4 w-4" />
            Trajets ({trajetsCount})
          </TabsTrigger>
          <TabsTrigger value="statistiques">
            <TrendingUp className="mr-2 h-4 w-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="informations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{chauffeur.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prénom</p>
                  <p className="font-medium">{chauffeur.prenom}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                {chauffeur.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{chauffeur.telephone}</p>
                    </div>
                  </div>
                )}

                {chauffeur.numero_permis && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">N° Permis</p>
                      <p className="font-medium">{chauffeur.numero_permis}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                {chauffeur.date_embauche && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date d&apos;embauche</p>
                      <p className="font-medium">
                        {format(new Date(chauffeur.date_embauche!), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <div className="mt-1">{getStatutBadge(chauffeur.statut)}</div>
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
                <Truck className="h-5 w-5" />
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
                      <TableHead>Itinéraire</TableHead>
                      <TableHead>Véhicule</TableHead>
                      <TableHead className="text-right">Distance</TableHead>
                      <TableHead className="text-right">Consommation</TableHead>
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
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {trajet.localite_depart?.nom} → {trajet.localite_arrivee?.nom}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {trajet.vehicule?.immatriculation || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {trajet.parcours_total ? `${trajet.parcours_total} km` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {trajet.consommation_au_100
                            ? `${trajet.consommation_au_100.toFixed(2)} L/100km`
                            : "-"}
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
                      Distance totale
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.km_total.toLocaleString("fr-FR")} km
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Conteneurs transportés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.nb_conteneurs}</div>
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
                      <span className="text-muted-foreground">Frais annexes total</span>
                      <span className="font-medium">
                        {formatCurrency(stats.cout_frais_total)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Coût total</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(stats.cout_carburant_total + stats.cout_frais_total)}
                      </span>
                    </div>
                    {stats.nb_trajets > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Coût moyen par trajet</span>
                          <span className="font-medium">
                            {formatCurrency(
                              (stats.cout_carburant_total + stats.cout_frais_total) /
                                stats.nb_trajets
                            )}
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
      </Tabs>
    </div>
  );
}
