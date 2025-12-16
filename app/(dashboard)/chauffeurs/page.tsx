/**
 * Page de liste des chauffeurs
 * Design "Fleet Command Center" avec:
 * - Header stats banner (depuis la vue DB chauffeur_status_stats)
 * - Filtres visuels par chips
 * - Grille de cartes responsive
 */

"use client";

import { useCallback, useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChauffeurPageHeader } from "@/components/chauffeurs/chauffeur-page-header";
import { ChauffeurCardGrid } from "@/components/chauffeurs/chauffeur-card";
import { ChauffeurForm } from "@/components/chauffeurs/chauffeur-form";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { useChauffeurStatusStats } from "@/hooks/use-chauffeur-status-stats";
import { useUserRole } from "@/hooks/use-user-role";
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

  // Handler pour fermer le dialogue et rafraîchir les données
  const handleSuccess = useCallback(() => {
    setDialogOpen(false);
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
    <div className="container pt-0 pb-6 space-y-6">
      {/* Header with stats from DB view and filters */}
      <ChauffeurPageHeader
        statusStats={chauffeurStats}
        totalCount={totalChauffeurs}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        activeStatus={activeStatus}
        onStatusChange={handleStatusChange}
        loading={loading}
      />

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? (
            <span className="inline-block w-24 h-4 bg-muted rounded animate-pulse" />
          ) : (
            <>
              {filteredChauffeurs.length} chauffeur{filteredChauffeurs.length !== 1 ? "s" : ""} affiché{filteredChauffeurs.length !== 1 ? "s" : ""}
              {(activeStatus || searchValue) && (
                <span className="text-muted-foreground/60"> sur {totalChauffeurs}</span>
              )}
            </>
          )}
        </p>

        {canManageDrivers && (
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau chauffeur</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        )}
      </div>

      {/* Cards grid (filtered) */}
      <ChauffeurCardGrid chauffeurs={filteredChauffeurs} loading={loading} />

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau chauffeur</DialogTitle>
          </DialogHeader>
          <ChauffeurForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
