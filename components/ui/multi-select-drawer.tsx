/**
 * MultiSelectDrawer - Drawer secondaire pour sélection multiple
 * Utilise Command + Search + Séparation sélectionnés/disponibles
 */

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronLeft, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  /** Texte secondaire (ex: région, marque) */
  secondary?: string;
}

interface MultiSelectDrawerProps {
  /** État d'ouverture contrôlé */
  open: boolean;
  /** Callback de changement d'état */
  onOpenChange: (open: boolean) => void;
  /** Titre du drawer */
  title: string;
  /** Description */
  description?: string;
  /** Options disponibles */
  options: MultiSelectOption[];
  /** Valeurs sélectionnées */
  value: string[];
  /** Callback de changement */
  onValueChange: (values: string[]) => void;
  /** Placeholder de recherche */
  searchPlaceholder?: string;
  /** Message si aucun résultat */
  emptyMessage?: string;
}

export function MultiSelectDrawer({
  open,
  onOpenChange,
  title,
  description,
  options,
  value,
  onValueChange,
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat",
}: MultiSelectDrawerProps) {
  const [search, setSearch] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Forcer le scroll en haut quand le drawer s'ouvre
  useEffect(() => {
    if (open && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [open]);

  // Filtrer par recherche
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.secondary?.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  // Séparer sélectionnés et disponibles
  const selectedOptions = useMemo(
    () => filteredOptions.filter((opt) => value.includes(opt.value)),
    [filteredOptions, value]
  );

  const unselectedOptions = useMemo(
    () => filteredOptions.filter((opt) => !value.includes(opt.value)),
    [filteredOptions, value]
  );

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onValueChange(newValue);
  };

  const handleClear = () => {
    onValueChange([]);
  };

  const handleApply = () => {
    onOpenChange(false);
  };

  const hasSelection = value.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "h-[85vh] flex flex-col",
          "z-[60]", // Au-dessus du drawer principal
          "transition-transform duration-150" // Animation rapide
        )}
      >
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <SheetTitle>{title}</SheetTitle>
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Barre de recherche */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Liste scrollable */}
        <div
          ref={scrollContainerRef}
          className="flex-1 mt-4 overflow-y-auto -mx-6 px-6"
          style={{ maxHeight: 'calc(85vh - 250px)' }}
        >
          {filteredOptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Options sélectionnées */}
              {selectedOptions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-primary">
                    Sélectionnés ({selectedOptions.length})
                  </h4>
                  <div className="space-y-1">
                    {selectedOptions.map((option) => (
                      <OptionItem
                        key={option.value}
                        option={option}
                        selected={true}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Séparateur */}
              {selectedOptions.length > 0 && unselectedOptions.length > 0 && (
                <div className="border-t" />
              )}

              {/* Options disponibles */}
              {unselectedOptions.length > 0 && (
                <div>
                  {selectedOptions.length > 0 && (
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                      Disponibles ({unselectedOptions.length})
                    </h4>
                  )}
                  <div className="space-y-1">
                    {unselectedOptions.map((option) => (
                      <OptionItem
                        key={option.value}
                        option={option}
                        selected={false}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions fixes en bas */}
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex gap-3">
            {hasSelection && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Tout effacer
              </Button>
            )}
            <Button onClick={handleApply} className="flex-1">
              Appliquer {hasSelection && `(${value.length})`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Composant interne pour chaque option
interface OptionItemProps {
  option: MultiSelectOption;
  selected: boolean;
  onToggle: (value: string) => void;
}

function OptionItem({ option, selected, onToggle }: OptionItemProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.value)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg",
        "transition-colors duration-150",
        "hover:bg-muted",
        selected && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-5 h-5 rounded border-2",
          "transition-all duration-150",
          selected
            ? "bg-primary border-primary"
            : "border-muted-foreground/30"
        )}
      >
        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>

      <div className="flex-1 text-left min-w-0">
        <p className={cn(
          "font-medium truncate",
          selected && "text-primary"
        )}>
          {option.label}
        </p>
        {option.secondary && (
          <p className="text-xs text-muted-foreground truncate">
            {option.secondary}
          </p>
        )}
      </div>
    </button>
  );
}
