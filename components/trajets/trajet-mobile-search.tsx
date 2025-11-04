/**
 * Barre de recherche mobile pour trajets
 * Recherche globale avec debounce
 */

"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TrajetMobileSearchProps {
  value?: string;
  onSearchChange: (value: string) => void;
}

export function TrajetMobileSearch({
  value = "",
  onSearchChange,
}: TrajetMobileSearchProps) {
  const [searchValue, setSearchValue] = useState(value);

  // Debounce de 500ms pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  const handleClear = () => {
    setSearchValue("");
  };

  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Rechercher un trajet..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {searchValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Effacer la recherche</span>
        </Button>
      )}
    </div>
  );
}
