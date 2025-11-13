"use client";

import { useState } from "react";
import { X, Download, Share, Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ScreenSize = "mobile" | "tablet" | "desktop";
type Platform = "ios" | "android" | "desktop";

interface InstallPromptDemoProps {
  screenSize?: ScreenSize;
  platform?: Platform;
  showIOSInstructions?: boolean;
}

/**
 * Composant de démo pour visualiser le InstallPrompt
 * sur différentes tailles d'écran sans dépendance au hook
 */
export function InstallPromptDemo({
  screenSize = "mobile",
  platform = "android",
  showIOSInstructions = false,
}: InstallPromptDemoProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  const canPromptInstall = platform !== "ios";

  const handleInstall = () => {
    setIsInstalling(true);
    setTimeout(() => {
      setIsInstalling(false);
      alert("Installation simulée avec succès !");
    }, 1500);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  // Mobile : Banner compact en bas (au-dessus de la bottom nav)
  if (screenSize === "mobile") {
    return (
      <div
        className={cn(
          "fixed bottom-20 left-0 right-0 z-40 px-4",
          "animate-in slide-in-from-bottom-5 duration-500"
        )}
      >
        <Card className="border-2 border-primary/20 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">
                  Installer Transport Manager
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Accès rapide et mode hors ligne
                </p>

                {/* iOS Instructions */}
                {showIOSInstructions && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Share className="h-3 w-3" />
                    <span>Puis &quot;Sur l&apos;écran d&apos;accueil&quot;</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {canPromptInstall && (
                    <Button
                      size="sm"
                      className="flex-1 h-8"
                      onClick={handleInstall}
                      disabled={isInstalling}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {isInstalling ? "..." : "Installer"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3"
                    onClick={handleDismiss}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tablette : Card medium en bas à droite
  if (screenSize === "tablet") {
    return (
      <Card
        className={cn(
          "fixed bottom-4 right-4 w-full max-w-md shadow-xl z-40",
          "border-2 border-primary/20",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          "animate-in slide-in-from-bottom-5 duration-500"
        )}
      >
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg pr-10 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Installer Transport Manager
          </CardTitle>
          <CardDescription>
            Accédez à l&apos;application même hors ligne
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Avantages */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary">✓</span>
              <span>Mode hors ligne</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary">✓</span>
              <span>Synchronisation auto</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary">✓</span>
              <span>Accès rapide</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary">✓</span>
              <span>Notifications</span>
            </div>
          </div>

          {/* iOS Instructions */}
          {showIOSInstructions && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Installation sur iOS :</p>
              <ol className="text-sm text-muted-foreground space-y-1 pl-4 list-decimal">
                <li className="flex items-center gap-2">
                  <Share className="inline h-4 w-4" /> Partager dans Safari
                </li>
                <li className="flex items-center gap-2">
                  <Plus className="inline h-3 w-3" /> Sur l&apos;écran
                  d&apos;accueil
                </li>
                <li>Appuyez sur &quot;Ajouter&quot;</li>
              </ol>
            </div>
          )}

          {/* Android/Desktop Instructions */}
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

          {!canPromptInstall && !showIOSInstructions && (
            <Button variant="outline" className="w-full" onClick={handleDismiss}>
              J&apos;ai compris
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Desktop : Card large avec tous les détails
  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 w-full max-w-lg shadow-2xl z-40",
        "border-2 border-primary/20",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "animate-in slide-in-from-bottom-5 duration-500"
      )}
    >
      <CardHeader className="relative pb-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-start gap-3 pr-10">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">
              Installer Transport Manager
            </CardTitle>
            <CardDescription className="mt-1">
              Profitez d&apos;une expérience optimisée avec notre application
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Avantages détaillés */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Pourquoi installer ?</p>
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Mode hors ligne complet</p>
                <p className="text-xs text-muted-foreground">
                  Enregistrez vos trajets même sans connexion internet
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Synchronisation automatique</p>
                <p className="text-xs text-muted-foreground">
                  Vos données se synchronisent dès que vous êtes connecté
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Accès instantané</p>
                <p className="text-xs text-muted-foreground">
                  Lancez l&apos;application directement depuis votre bureau
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium">Notifications push</p>
                <p className="text-xs text-muted-foreground">
                  Recevez des alertes pour vos trajets et véhicules
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* iOS Instructions */}
        {showIOSInstructions && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium flex items-center gap-2">
              <Share className="h-4 w-4" />
              Comment installer sur iOS :
            </p>
            <ol className="text-sm text-muted-foreground space-y-2 pl-4 list-decimal">
              <li>
                Appuyez sur le bouton{" "}
                <Share className="inline h-4 w-4 mx-1" /> (Partager) dans Safari
              </li>
              <li>
                Faites défiler et sélectionnez{" "}
                <Plus className="inline h-3 w-3 mx-1" /> &quot;Sur l&apos;écran
                d&apos;accueil&quot;
              </li>
              <li>Appuyez sur &quot;Ajouter&quot; en haut à droite</li>
              <li>
                L&apos;application apparaîtra sur votre écran d&apos;accueil
              </li>
            </ol>
          </div>
        )}

        {/* Android/Desktop Prompt */}
        {canPromptInstall && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {platform === "android"
                ? "Installation sur Android"
                : "Installation sur votre ordinateur"}
            </p>
            <p className="text-sm text-muted-foreground">
              Cliquez sur le bouton ci-dessous pour installer l&apos;application.
              Elle sera ajoutée à{" "}
              {platform === "android"
                ? "votre écran d'accueil"
                : "vos applications"}
              .
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {canPromptInstall && (
            <Button
              className="flex-1"
              size="lg"
              onClick={handleInstall}
              disabled={isInstalling}
            >
              <Download className="h-4 w-4 mr-2" />
              {isInstalling ? "Installation en cours..." : "Installer maintenant"}
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={handleDismiss}
            className={canPromptInstall ? "" : "flex-1"}
          >
            {canPromptInstall ? "Plus tard" : "J'ai compris"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
