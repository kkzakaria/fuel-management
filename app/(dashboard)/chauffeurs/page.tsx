/**
 * Page de liste des chauffeurs
 * Design "Floating Command Bar" avec:
 * - Header sticky compact avec stats, filtres et actions
 * - Grille de cartes responsive avec scroll
 */

"use client";

import { useCallback, useState, useMemo } from "react";
import { ChauffeurPageHeader } from "@/components/chauffeurs/chauffeur-page-header";
import { ChauffeurCardGrid } from "@/components/chauffeurs/chauffeur-card";
import { ChauffeurDialog } from "@/components/chauffeurs/chauffeur-dialog";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { useChauffeurStatusStats } from "@/hooks/use-chauffeur-status-stats";
import { useUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import type { Chauffeur } from "@/lib/supabase/types";

type StatusKey = "actif" | "en_voyage" | "en_conge" | "suspendu" | "inactif";

export default function ChauffeursPage() {
  const { canManageDrivers } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Local filter state for client-side filtering
  const [activeStatus, setActiveStatus] = useState<StatusKey | null>(null);
  const [searchValue, setSearchValue] = useState("");

  // Fetch status stats from database view (always accurate)
  const {
    chauffeurStats,
    totalChauffeurs,
    loading: loadingStats,
    refetch: refetchStats,
  } = useChauffeurStatusStats();

  // Fetch ALL chauffeurs (no server-side filtering)
  const {
    chauffeurs: allChauffeurs,
    loading: loadingChauffeurs,
    error,
    refresh: refreshChauffeurs,
  } = useChauffeurs({
    pageSize: 200, // Get all
    autoRefresh: 60000,
  });

  const loading = loadingStats || loadingChauffeurs;

  // Handler pour rafraîchir les données après création/modification
  const handleSuccess = useCallback(() => {
    refreshChauffeurs();
    refetchStats();
  }, [refreshChauffeurs, refetchStats]);

  // Handle status filter change (client-side)
  const handleStatusChange = useCallback((status: StatusKey | null) => {
    setActiveStatus(status);
  }, []);

  // Handle search change (client-side)
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  // Filter chauffeurs client-side
  const filteredChauffeurs = useMemo(() => {
    let result: Chauffeur[] = allChauffeurs;

    // Filter by status
    if (activeStatus) {
      result = result.filter((c) => c.statut === activeStatus);
    }

    // Filter by search
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase().trim();
      result = result.filter((c) => {
        const nom = c.nom?.toLowerCase() || "";
        const prenom = c.prenom?.toLowerCase() || "";
        const telephone = c.telephone?.toLowerCase() || "";
        const permis = c.numero_permis?.toLowerCase() || "";
        return (
          nom.includes(search) ||
          prenom.includes(search) ||
          telephone.includes(search) ||
          permis.includes(search)
        );
      });
    }

    return result;
  }, [allChauffeurs, activeStatus, searchValue]);

  if (error) {
    return (
      <div className="container pt-0 pb-6 space-y-4">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Erreur de chargement</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm mb-4">
            {error.message}
          </p>
          <Button onClick={refreshChauffeurs} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-0 pb-6">
      {/* Sticky header with stats, filters, search, and add button */}
      <ChauffeurPageHeader
        statusStats={chauffeurStats}
        totalCount={totalChauffeurs}
        filteredCount={filteredChauffeurs.length}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        activeStatus={activeStatus}
        onStatusChange={handleStatusChange}
        onAddClick={() => setDialogOpen(true)}
        canAdd={canManageDrivers}
        loading={loading}
      />

      {/* Cards grid with top padding for sticky header */}
      <div className="pt-4">
        <ChauffeurCardGrid chauffeurs={filteredChauffeurs} loading={loading} />
      </div>

      {/* Create/Edit dialog */}
      <ChauffeurDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
