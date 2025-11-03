/**
 * Mobile Filter Drawer
 * Composant wrapper pour afficher les filtres dans un drawer sur mobile
 * et inline sur desktop
 */

"use client";

import { ReactNode, useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileFilterDrawerProps {
  /** Contenu des filtres à afficher */
  children: ReactNode;
  /** Nombre de filtres actifs (pour le badge) */
  activeFiltersCount: number;
  /** Callback pour réinitialiser les filtres */
  onClearFilters: () => void;
  /** Titre du drawer (optionnel) */
  title?: string;
  /** Description du drawer (optionnel) */
  description?: string;
}

export function MobileFilterDrawer({
  children,
  activeFiltersCount,
  onClearFilters,
  title = "Filtres",
  description = "Filtrer et affiner vos résultats",
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleClearFilters = () => {
    onClearFilters();
    setOpen(false);
  };

  return (
    <>
      {/* Mobile: Bouton pour ouvrir le drawer */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtrer</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-auto h-5 min-w-[20px] rounded-full px-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>{title}</SheetTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </Button>
                )}
              </div>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Affichage inline normal */}
      <div className="hidden md:block">
        {children}
      </div>
    </>
  );
}
