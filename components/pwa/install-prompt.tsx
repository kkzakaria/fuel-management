"use client";

import { useState } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Composant pour promouvoir l'installation de la PWA
 * Affiche des instructions adaptées selon la plateforme (iOS/Android/Desktop)
 */
export function InstallPrompt() {
  const {
    isInstallable,
    platform,
    canPromptInstall,
    shouldShowIOSInstructions,
    promptInstall,
  } = useInstallPrompt();

  const [isVisible, setIsVisible] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  // Ne pas afficher si pas installable, déjà caché, ou déjà installé
  if (!isInstallable || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    if (canPromptInstall) {
      setIsInstalling(true);
      const result = await promptInstall();

      if (result.success && result.outcome === "accepted") {
        setIsVisible(false);
      }
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Stocker qu'on a refusé (localStorage) pour ne pas redemander tout de suite
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  return (
    <Card className="fixed bottom-4 right-4 w-full max-w-sm shadow-lg z-40 border-2 border-primary/20">
      <CardHeader className="relative pb-3">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-lg pr-8">
          Installer Transport Manager
        </CardTitle>
        <CardDescription>
          Accédez à l&apos;application même hors ligne
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Avantages */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <span className="text-lg">✓</span>
            <span>Fonctionne hors ligne</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-lg">✓</span>
            <span>Synchronisation automatique</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-lg">✓</span>
            <span>Accès rapide depuis l&apos;écran d&apos;accueil</span>
          </p>
        </div>

        {/* Instructions selon la plateforme */}
        {shouldShowIOSInstructions && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Pour installer sur iOS :</p>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span>1.</span>
                <span>
                  Appuyez sur le bouton <Share className="inline h-4 w-4 mx-1" />
                  (Partager) dans Safari
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>2.</span>
                <span>
                  Sélectionnez &quot;<Plus className="inline h-3 w-3 mx-1" /> Sur l&apos;écran d&apos;accueil&quot;
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>3.</span>
                <span>Appuyez sur &quot;Ajouter&quot;</span>
              </li>
            </ol>
          </div>
        )}

        {canPromptInstall && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {platform === "android" ? "Pour installer sur Android :" : "Pour installer :"}
            </p>
            <p className="text-sm text-muted-foreground">
              Cliquez sur le bouton ci-dessous pour installer l&apos;application sur
              {platform === "android" ? " votre appareil Android" : " votre ordinateur"}.
            </p>
          </div>
        )}

        {/* Bouton d'action */}
        {canPromptInstall && (
          <Button
            className="w-full"
            onClick={handleInstall}
            disabled={isInstalling}
          >
            <Download className="h-4 w-4 mr-2" />
            {isInstalling ? "Installation..." : "Installer l'application"}
          </Button>
        )}

        {!canPromptInstall && !shouldShowIOSInstructions && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDismiss}
          >
            J&apos;ai compris
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
