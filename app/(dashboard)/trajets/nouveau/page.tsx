/**
 * Page de création d'un nouveau trajet - Industrial Design
 *
 * Features:
 * - Sticky header with back navigation
 * - Progress indicator
 * - Responsive layout (mobile/tablet/desktop)
 * - Support for chauffeur pre-selection via ?chauffeurId=xxx
 * - Support for return URL via ?returnUrl=xxx
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Route, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TrajetFormRedesign } from "@/components/trajets/trajet-form-redesign";

export default function NouveauTrajetPage() {
  const searchParams = useSearchParams();
  const chauffeurId = searchParams.get("chauffeurId");
  const returnUrl = searchParams.get("returnUrl");

  // Track scroll for header styling
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // URL de retour pour le bouton back et après création
  const backUrl = returnUrl || "/trajets";

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div
        className={cn(
          "sticky top-0 z-40 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
          "pb-4 pt-4",
          "backdrop-blur-xl",
          "border-b transition-all duration-300",
          isScrolled
            ? "border-border bg-background/95 shadow-md"
            : "border-transparent bg-background/60 shadow-none"
        )}
      >
        {/* Header content centered with same max-width as form */}
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0 rounded-lg"
            >
              <Link href={backUrl}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Retour</span>
              </Link>
            </Button>

            {/* Title section */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  "bg-gradient-to-br from-amber-500 to-orange-600",
                  "shadow-lg shadow-amber-500/20"
                )}
              >
                <Route className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none sm:text-xl">
                  Nouveau trajet
                </h1>
                <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">
                  Créer un trajet de livraison
                </p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Quick tip - Desktop only */}
            <div className="hidden items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950/30 lg:flex">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-amber-700 dark:text-amber-400">
                Les sections avec{" "}
                <span className="font-medium">*</span> sont obligatoires
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <TrajetFormRedesign
          defaultChauffeurId={chauffeurId || undefined}
          returnUrl={returnUrl || undefined}
        />
      </div>
    </div>
  );
}
