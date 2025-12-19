/**
 * Page de liste des trajets - Industrial Design
 *
 * Design responsive avec:
 * - Header sticky avec stats et filtres intégrés
 * - Mobile: Cards avec infinite scroll
 * - Tablette: Grille 2 colonnes
 * - Desktop: Table enrichie avec indicateurs visuels
 */

"use client";

import { useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  TrajetPageHeader,
  type TrajetStatusStats,
} from "@/components/trajets/trajet-page-header";
import { TrajetCardList, TrajetCardGrid } from "@/components/trajets/trajet-card";
import { TrajetTableEnhanced } from "@/components/trajets/trajet-table-enhanced";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";
import { Button } from "@/components/ui/button";
import { useTrajets } from "@/hooks/use-trajets";
import { useUserRole } from "@/hooks/use-user-role";
import { AlertTriangle } from "lucide-react";
import type { TrajetListItem } from "@/components/trajets/trajet-table";

type StatusKey = "en_cours" | "termine" | "annule";

export default function TrajetsPage() {
  const router = useRouter();
  const { canCreateTrips } = useUserRole();

  // Local filter state for client-side filtering
  const [activeStatus, setActiveStatus] = useState<StatusKey | null>(null);
  const [searchValue, setSearchValue] = useState("");

  // Fetch ALL trajets (client-side filtering for instant response)
  const {
    trajets: allTrajets,
    loading,
    error,
    refresh,
    loadMore,
    hasNextPage,
  } = useTrajets({
    mode: "infinite",
    pageSize: 50,
    autoRefresh: 60000,
  });

  // Calculate stats from all trajets
  const stats = useMemo<TrajetStatusStats>(() => {
    const result = {
      en_cours: 0,
      termine: 0,
      annule: 0,
      with_alerts: 0,
    };

    allTrajets.forEach((t) => {
      if (t.statut === "en_cours") result.en_cours++;
      else if (t.statut === "termine") result.termine++;
      else if (t.statut === "annule") result.annule++;

      // Check for fuel alerts
      const hasEcartAlert = t.ecart_litrage && Math.abs(t.ecart_litrage) > 10;
      const hasConsommationAlert = t.consommation_au_100 && t.consommation_au_100 > 40;
      if (hasEcartAlert || hasConsommationAlert) {
        result.with_alerts++;
      }
    });

    return result;
  }, [allTrajets]);

  // Filter trajets client-side
  const filteredTrajets = useMemo(() => {
    let result: TrajetListItem[] = allTrajets;

    // Filter by status
    if (activeStatus) {
      result = result.filter((t) => t.statut === activeStatus);
    }

    // Filter by search
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase().trim();
      result = result.filter((t) => {
        const numero = t.numero_trajet?.toLowerCase() || "";
        const chauffeurNom = t.chauffeur?.nom?.toLowerCase() || "";
        const chauffeurPrenom = t.chauffeur?.prenom?.toLowerCase() || "";
        const vehicule = t.vehicule?.immatriculation?.toLowerCase() || "";
        const depart = t.localite_depart?.nom?.toLowerCase() || "";
        const arrivee = t.localite_arrivee?.nom?.toLowerCase() || "";

        return (
          numero.includes(search) ||
          chauffeurNom.includes(search) ||
          chauffeurPrenom.includes(search) ||
          vehicule.includes(search) ||
          depart.includes(search) ||
          arrivee.includes(search)
        );
      });
    }

    return result;
  }, [allTrajets, activeStatus, searchValue]);

  // Handlers
  const handleStatusChange = useCallback((status: StatusKey | null) => {
    setActiveStatus(status);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleAddClick = useCallback(() => {
    router.push("/trajets/nouveau");
  }, [router]);

  // Error state
  if (error) {
    return (
      <div className="container pb-6 pt-0">
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">Erreur de chargement</h3>
          <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
            {error.message}
          </p>
          <Button onClick={refresh} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-6 pt-0">
      {/* Sticky header with stats, filters, search, and add button */}
      <TrajetPageHeader
        stats={stats}
        totalCount={allTrajets.length}
        filteredCount={filteredTrajets.length}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        activeStatus={activeStatus}
        onStatusChange={handleStatusChange}
        onAddClick={handleAddClick}
        canAdd={canCreateTrips}
        loading={loading && allTrajets.length === 0}
      />

      {/* Content with top padding for sticky header */}
      <div className="pt-4">
        {/* === MOBILE: Card list with infinite scroll === */}
        <div className="md:hidden">
          <InfiniteScroll
            onLoadMore={loadMore}
            hasMore={hasNextPage && !activeStatus && !searchValue}
            loading={loading}
          >
            <TrajetCardList trajets={filteredTrajets} loading={loading && filteredTrajets.length === 0} />
          </InfiniteScroll>
        </div>

        {/* === TABLET: 2-column card grid === */}
        <div className="hidden md:block xl:hidden">
          <TrajetCardGrid trajets={filteredTrajets} loading={loading && filteredTrajets.length === 0} />
        </div>

        {/* === DESKTOP: Enhanced table === */}
        <div className="hidden xl:block">
          <TrajetTableEnhanced trajets={filteredTrajets} loading={loading && filteredTrajets.length === 0} />
        </div>
      </div>
    </div>
  );
}
