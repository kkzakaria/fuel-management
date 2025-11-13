/**
 * Barre de recherche mobile pour les véhicules
 * Champ de recherche simple avec icône
 */

"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VehiculeMobileSearchProps {
  value: string | undefined;
  onSearchChange: (value: string) => void;
}

export function VehiculeMobileSearch({
  value,
  onSearchChange,
}: VehiculeMobileSearchProps) {
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
