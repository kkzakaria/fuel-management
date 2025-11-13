/**
 * Barre de recherche mobile pour les sous-traitants
 * Champ de recherche simple avec icône
 */

"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SousTraitantMobileSearchProps {
  value: string | undefined;
  onSearchChange: (value: string) => void;
}

export function SousTraitantMobileSearch({
  value,
  onSearchChange,
}: SousTraitantMobileSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Rechercher..."
        value={value || ""}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
