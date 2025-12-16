/**
 * Page de liste des chauffeurs
 * Design "Fleet Command Center" avec:
 * - Header stats banner
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
import { useUserRole } from "@/hooks/use-user-role";

type StatusKey = "actif" | "en_voyage" | "en_conge" | "suspendu" | "inactif";

export default function ChauffeursPage() {
  const { canManageDrivers } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    chauffeurs,
    loading,
    error,
    filters,
    updateFilters,
    count,
    refresh,
  } = useChauffeurs({
    pageSize: 100,
    autoRefresh: 60000,
  });

  // Handler pour fermer le dialogue et rafraîchir les données
  const handleSuccess = useCallback(() => {
    setDialogOpen(false);
    refresh();
  }, [refresh]);

  // Handle status filter change
  const handleStatusChange = useCallback((status: StatusKey | null) => {
    updateFilters({ statut: status });
  }, [updateFilters]);

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    updateFilters({ search: value });
  }, [updateFilters]);

  // Filtrer les chauffeurs côté client pour les stats (on a déjà tous les chauffeurs)
  const allChauffeurs = useMemo(() => {
    // Pour les stats, on veut tous les chauffeurs sans filtre
    return chauffeurs;
  }, [chauffeurs]);

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
          <Button onClick={refresh} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container pt-0 pb-6 space-y-6">
      {/* Header with stats and filters */}
      <ChauffeurPageHeader
        chauffeurs={allChauffeurs}
        totalCount={count}
        searchValue={filters.search ?? ""}
        onSearchChange={handleSearchChange}
        activeStatus={(filters.statut as StatusKey) ?? null}
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
              {chauffeurs.length} chauffeur{chauffeurs.length !== 1 ? "s" : ""} affiché{chauffeurs.length !== 1 ? "s" : ""}
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

      {/* Cards grid */}
      <ChauffeurCardGrid chauffeurs={chauffeurs} loading={loading} />

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
