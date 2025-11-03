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
import { TrajetListItemComponent } from "@/components/trajets/trajet-list-item";
import { TrajetFilters } from "@/components/trajets/trajet-filters";
import { TrajetPagination } from "@/components/trajets/trajet-pagination";
import { useTrajets } from "@/hooks/use-trajets";
import { useTrajetFormData } from "@/hooks/use-trajet-form-data";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="container py-4 space-y-4 sm:py-6 sm:space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Trajets</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
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

      {/* Table (Desktop) */}
      <div className="hidden md:block">
        <TrajetTable trajets={trajets} loading={loading} />
      </div>

      {/* Liste (Mobile) */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : trajets.length === 0 ? (
          <div className="rounded-md border p-8 text-center">
            <p className="text-muted-foreground">Aucun trajet trouvé</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            {trajets.map((trajet) => (
              <TrajetListItemComponent key={trajet.id} trajet={trajet} />
            ))}
          </div>
        )}
      </div>

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
