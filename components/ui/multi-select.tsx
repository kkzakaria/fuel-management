/**
 * Composant de sélection multiple réutilisable
 * - Recherche intégrée
 * - Sélection simple ou multiple
 * - Éléments sélectionnés affichés en haut
 * - Séparation visuelle entre sélectionnés et non-sélectionnés
 */

"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  value: string;
  label: string;
  /** Données supplémentaires optionnelles */
  metadata?: Record<string, unknown>;
}

interface MultiSelectProps {
  /** Options disponibles */
  options: MultiSelectOption[];
  /** Valeurs sélectionnées */
  value?: string[];
  /** Callback lors du changement */
  onValueChange?: (values: string[]) => void;
  /** Placeholder quand aucune valeur */
  placeholder?: string;
  /** Texte de recherche placeholder */
  searchPlaceholder?: string;
  /** Message quand aucun résultat */
  emptyMessage?: string;
  /** Désactivé */
  disabled?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** Mode de sélection */
  mode?: "single" | "multiple";
  /** Ouvrir automatiquement au montage */
  defaultOpen?: boolean;
  /** Nombre maximum de badges visibles */
  maxBadges?: number;
  /** Afficher le bouton clear */
  showClear?: boolean;
}

export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat.",
  disabled = false,
  className,
  mode = "multiple",
  defaultOpen = false,
  maxBadges = 3,
  showClear = true,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [searchValue, setSearchValue] = React.useState("");

  // Ouvrir automatiquement au montage si defaultOpen est true
  React.useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  // Séparer les options sélectionnées et non sélectionnées
  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  );
  const unselectedOptions = options.filter(
    (option) => !value.includes(option.value)
  );

  const handleSelect = (selectedValue: string) => {
    if (mode === "single") {
      // Mode simple : remplacer la sélection
      onValueChange?.([selectedValue]);
      setOpen(false);
    } else {
      // Mode multiple : toggle
      const newValue = value.includes(selectedValue)
        ? value.filter((v) => v !== selectedValue)
        : [...value, selectedValue];
      onValueChange?.(newValue);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange?.([]);
  };

  const handleRemoveBadge = (
    e: React.MouseEvent,
    valueToRemove: string
  ) => {
    e.stopPropagation();
    onValueChange?.(value.filter((v) => v !== valueToRemove));
  };

  // Texte du trigger
  const getTriggerText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const option = options.find((opt) => opt.value === value[0]);
      return option?.label || placeholder;
    }
    return `${value.length} sélectionné${value.length > 1 ? "s" : ""}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            value.length === 0 && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="flex-1 truncate text-left">{getTriggerText()}</span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {showClear && value.length > 0 && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                onClick={handleClear}
              />
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            {/* Afficher les badges des sélections en mode multiple */}
            {mode === "multiple" && value.length > 0 && (
              <div className="px-2 py-2 border-b">
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.slice(0, maxBadges).map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="gap-1"
                    >
                      {option.label}
                      <X
                        className="h-3 w-3 cursor-pointer hover:opacity-70"
                        onClick={(e) => handleRemoveBadge(e, option.value)}
                      />
                    </Badge>
                  ))}
                  {value.length > maxBadges && (
                    <Badge variant="secondary">
                      +{value.length - maxBadges}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Options sélectionnées (affichées en haut) */}
            {selectedOptions.length > 0 && (
              <>
                <CommandGroup heading="Sélectionnés">
                  {selectedOptions
                    .filter((option) =>
                      option.label
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                    )
                    .map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        keywords={[option.label]}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer"
                      >
                        <Check className="mr-2 h-4 w-4 opacity-100" />
                        {option.label}
                      </CommandItem>
                    ))}
                </CommandGroup>

                {/* Séparateur visible entre sélectionnés et non-sélectionnés */}
                {unselectedOptions.length > 0 && <CommandSeparator />}
              </>
            )}

            {/* Options non sélectionnées */}
            {unselectedOptions.length > 0 && (
              <CommandGroup
                heading={
                  selectedOptions.length > 0 ? "Disponibles" : undefined
                }
              >
                {unselectedOptions
                  .filter((option) =>
                    option.label
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  )
                  .map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      keywords={[option.label]}
                      onSelect={() => handleSelect(option.value)}
                      className="cursor-pointer"
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      {option.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
