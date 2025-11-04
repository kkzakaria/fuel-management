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
  /** Afficher le bouton aussi sur tablette (optionnel) */
  showOnTablet?: boolean;
}

export function MobileFilterDrawer({
  children,
  activeFiltersCount,
  onClearFilters,
  title = "Filtres",
  description = "Filtrer et affiner vos résultats",
  showOnTablet = false,
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleClearFilters = () => {
    onClearFilters();
    // Ne pas fermer le drawer pour permettre de continuer à ajuster les filtres
  };

  const buttonVisibilityClass = showOnTablet ? "xl:hidden" : "md:hidden";
  const inlineVisibilityClass = showOnTablet ? "hidden xl:block" : "hidden md:block";

  return (
    <>
      {/* Mobile/Tablet: Bouton pour ouvrir le drawer */}
      <div className={buttonVisibilityClass}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 whitespace-nowrap">
              <Filter className="h-4 w-4" />
              <span>Filtrer</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full px-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] flex flex-col">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto py-6">
              {children}
            </div>

            {/* Boutons d'action fixes en bas */}
            <div className="flex-shrink-0 border-t pt-4 pb-4 px-1">
              <div className="flex gap-3">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </Button>
                )}
                <Button
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Appliquer {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Affichage inline normal */}
      <div className={inlineVisibilityClass}>
        {children}
      </div>
    </>
  );
}
