/**
 * DateRangeDrawer - Drawer secondaire pour sélection de période
 * Utilise Calendar avec sélection de range
 */

"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DateRangeDrawerProps {
  /** État d'ouverture contrôlé */
  open: boolean;
  /** Callback de changement d'état */
  onOpenChange: (open: boolean) => void;
  /** Date de début */
  dateDebut?: string;
  /** Date de fin */
  dateFin?: string;
  /** Callback de changement */
  onDateRangeChange: (dateDebut?: string, dateFin?: string) => void;
}

export function DateRangeDrawer({
  open,
  onOpenChange,
  dateDebut,
  dateFin,
  onDateRangeChange,
}: DateRangeDrawerProps) {
  // État local pour la sélection en cours (avant application)
  const [localDate, setLocalDate] = useState<DateRange | undefined>(() => ({
    from: dateDebut ? new Date(dateDebut) : undefined,
    to: dateFin ? new Date(dateFin) : undefined,
  }));

  // Réinitialiser l'état local quand le drawer s'ouvre (asynchrone pour éviter setState synchrone)
  useEffect(() => {
    if (!open) return;

    // Utiliser setTimeout avec 0ms pour rendre l'opération asynchrone
    const timeoutId = setTimeout(() => {
      setLocalDate({
        from: dateDebut ? new Date(dateDebut) : undefined,
        to: dateFin ? new Date(dateFin) : undefined,
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [open, dateDebut, dateFin]);

  const handleApply = () => {
    onDateRangeChange(
      localDate?.from?.toISOString(),
      localDate?.to?.toISOString()
    );
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocalDate(undefined);
    onDateRangeChange(undefined, undefined);
  };

  const hasSelection = localDate?.from || localDate?.to;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "h-auto max-h-[85vh]",
          "z-[60]", // Au-dessus du drawer principal (z-50)
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
            <div className="flex-1">
              <SheetTitle>Sélectionner une période</SheetTitle>
              <SheetDescription>
                Filtrer les trajets par date
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Calendrier */}
        <div className="py-6 flex justify-center">
          <Calendar
            mode="range"
            selected={localDate}
            onSelect={setLocalDate}
            numberOfMonths={1}
            locale={fr}
            className="rounded-md border"
          />
        </div>

        {/* Aperçu de la sélection */}
        {hasSelection && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {localDate?.from && format(localDate.from, "dd MMM yyyy", { locale: fr })}
                {localDate?.to && (
                  <>
                    {" → "}
                    {format(localDate.to, "dd MMM yyyy", { locale: fr })}
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {hasSelection && (
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Effacer
            </Button>
          )}
          <Button
            onClick={handleApply}
            disabled={!hasSelection}
            className="flex-1"
          >
            Appliquer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
