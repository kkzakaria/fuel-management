/**
 * FilterButton - Bouton réutilisable pour ouvrir des drawers de filtres
 * Affiche badges et aperçu des sélections
 */

"use client";

import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilterButtonProps {
  /** Icône du filtre */
  icon: ReactNode;
  /** Label du filtre */
  label: string;
  /** Nombre d'éléments sélectionnés */
  selectedCount?: number;
  /** Aperçu de la sélection (ex: premier nom) */
  preview?: string;
  /** Callback au clic */
  onClick: () => void;
  /** Désactivé */
  disabled?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
}

export function FilterButton({
  icon,
  label,
  selectedCount = 0,
  preview,
  onClick,
  disabled = false,
  className,
}: FilterButtonProps) {
  const hasSelection = selectedCount > 0;

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full justify-start h-auto py-3 px-4",
        "transition-all duration-150",
        hasSelection && "border-primary/50 bg-primary/5",
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icône */}
        <div className={cn(
          "shrink-0",
          hasSelection && "text-primary"
        )}>
          {icon}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium">{label}</span>
            {hasSelection && (
              <Badge variant="secondary" className="shrink-0">
                {selectedCount}
              </Badge>
            )}
          </div>

          {/* Aperçu */}
          {preview && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {preview}
            </p>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    </Button>
  );
}
