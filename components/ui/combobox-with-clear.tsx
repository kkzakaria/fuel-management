/**
 * Combobox avec bouton clear
 * Extension du Combobox standard avec possibilité d'effacer la sélection
 */

"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxWithClearProps {
  /** Options disponibles */
  options: ComboboxOption[];
  /** Valeur sélectionnée */
  value?: string;
  /** Callback lors du changement */
  onValueChange?: (value: string) => void;
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
  /** Afficher le bouton clear */
  showClear?: boolean;
  /** Ouvrir automatiquement au montage */
  defaultOpen?: boolean;
}

export function ComboboxWithClear({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun résultat.",
  disabled = false,
  className,
  showClear = true,
  defaultOpen = false,
}: ComboboxWithClearProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  // Ouvrir automatiquement au montage si defaultOpen est true
  React.useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  const selectedOption = options.find((option) => option.value === value);
  const hasValue = value && value !== "all";

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange?.("all");
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
            !hasValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {showClear && hasValue && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label]}
                  onSelect={(currentValue) => {
                    onValueChange?.(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
