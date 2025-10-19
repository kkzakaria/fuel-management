/**
 * Page de liste des trajets
 * Affiche la table avec filtres et pagination
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrajetTable } from "@/components/trajets/trajet-table";
import { TrajetFilters } from "@/components/trajets/trajet-filters";
import { TrajetPagination } from "@/components/trajets/trajet-pagination";
import { useTrajets } from "@/hooks/use-trajets";
import { useTrajetFormData } from "@/hooks/use-trajet-form-data";

export default function TrajetsPage() {
  const {
    trajets,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    page,
    totalPages,
    count,
    pageSize,
    goToPage,
    refresh,
  } = useTrajets({
    pageSize: 20,
    autoRefresh: 60000, // Refresh every minute
  });

  const { chauffeurs, vehicules, localites } = useTrajetFormData();

  // Rafraîchir quand on revient sur la page
  useEffect(() => {
    const handleFocus = () => {
      refresh();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Erreur de chargement</p>
              <p className="text-sm">{error.message}</p>
              <Button onClick={refresh} variant="outline" className="mt-4">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trajets</h1>
          <p className="text-muted-foreground">
            Gestion des trajets et livraisons de conteneurs
          </p>
        </div>
        <Button asChild>
          <Link href="/trajets/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau trajet
          </Link>
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total trajets</p>
              <p className="text-3xl font-bold">{count}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Cette page</p>
              <p className="text-3xl font-bold">{trajets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Pages</p>
              <p className="text-3xl font-bold">
                {page} / {totalPages || 1}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <TrajetFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        chauffeurs={chauffeurs}
        vehicules={vehicules}
        localites={localites}
      />

      {/* Table */}
      <TrajetTable trajets={trajets} loading={loading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <TrajetPagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={count}
          pageSize={pageSize}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}
