"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Hook pour gérer le prompt d'installation PWA
 * Détecte iOS, Android et Desktop pour afficher les instructions appropriées
 */
export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    // Détecter la plateforme
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      setPlatform("ios");
      // iOS ne supporte pas beforeinstallprompt
      // On affiche toujours les instructions manuelles
      setIsInstallable(true);
    } else if (isAndroid) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Vérifier si déjà installée
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Écouter l'événement beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Écouter l'événement d'installation réussie
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<{
    success: boolean;
    outcome?: "accepted" | "dismissed";
  }> => {
    if (!installPrompt) {
      return { success: false };
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        setInstallPrompt(null);
        setIsInstallable(false);
        return { success: true, outcome: "accepted" };
      } else {
        return { success: false, outcome: "dismissed" };
      }
    } catch (error) {
      console.error("Erreur prompt installation:", error);
      return { success: false };
    }
  };

  // Vérifier si on peut afficher le prompt natif
  const canPromptInstall = installPrompt !== null && platform !== "ios";

  // Fonction pour détecter si on est sur iOS et pas déjà installé
  const shouldShowIOSInstructions =
    platform === "ios" && !isInstalled && isInstallable;

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    platform,
    canPromptInstall,
    shouldShowIOSInstructions,
    promptInstall,
  };
}
