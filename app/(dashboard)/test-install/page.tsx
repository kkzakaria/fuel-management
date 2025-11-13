"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InstallPromptDemo } from "@/components/pwa/install-prompt-demo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/**
 * Page de test pour visualiser le InstallPrompt sur différents formats
 */
export default function TestInstallPage() {
  const [screenSize, setScreenSize] = useState<
    "mobile" | "tablet" | "desktop"
  >("mobile");
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">(
    "android"
  );
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test InstallPrompt</h1>
        <p className="text-muted-foreground mt-2">
          Visualisation du prompt d&apos;installation sur différents formats
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h2 className="font-semibold">Configuration</h2>

          <div className="space-y-2">
            <Label>Format d&apos;écran</Label>
            <Select
              value={screenSize}
              onValueChange={(value: "mobile" | "tablet" | "desktop") =>
                setScreenSize(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">
                  📱 Mobile (&lt; 640px)
                </SelectItem>
                <SelectItem value="tablet">
                  📱 Tablette (640px - 1024px)
                </SelectItem>
                <SelectItem value="desktop">
                  🖥️ Desktop (&gt; 1024px)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Plateforme</Label>
            <Select
              value={platform}
              onValueChange={(value: "ios" | "android" | "desktop") =>
                setPlatform(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ios">iOS (Safari)</SelectItem>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Instructions iOS</Label>
            <div className="flex gap-2">
              <Button
                variant={showIOSInstructions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowIOSInstructions(true)}
              >
                Afficher
              </Button>
              <Button
                variant={!showIOSInstructions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowIOSInstructions(false)}
              >
                Masquer
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPrompt(!showPrompt)}
            >
              {showPrompt ? "Masquer" : "Afficher"} le prompt
            </Button>
          </div>
        </div>

        {/* Informations */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h2 className="font-semibold">Caractéristiques du design</h2>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">📱 Mobile :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Banner compact en bas</li>
                <li>Au-dessus de la bottom navigation</li>
                <li>Icône + titre + action rapide</li>
                <li>Minimise l&apos;intrusion</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-1">📱 Tablette :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Card medium en bas à droite</li>
                <li>Grille 2 colonnes pour avantages</li>
                <li>Plus d&apos;espace pour détails</li>
                <li>Position non-intrusive</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-1">🖥️ Desktop :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Card large avec tous les détails</li>
                <li>4 avantages détaillés</li>
                <li>Instructions complètes</li>
                <li>Présentation professionnelle</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">Fonctionnalités communes :</h2>
        <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Animations d&apos;entrée fluides</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Backdrop blur pour modernité</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Bordure accentuée (primary/20)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Bouton fermer toujours accessible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Instructions adaptées par plateforme</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            <span>Délai de 3s + refus persisté 7 jours</span>
          </li>
        </ul>
      </div>

      {/* Prompt Demo */}
      {showPrompt && (
        <InstallPromptDemo
          screenSize={screenSize}
          platform={platform}
          showIOSInstructions={showIOSInstructions}
        />
      )}
    </div>
  );
}
