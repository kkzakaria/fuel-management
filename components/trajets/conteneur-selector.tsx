/**
 * Composant de sélection multiple de conteneurs pour un trajet
 * Chaque conteneur est une entrée individuelle avec son propre numéro
 */

"use client";

import { useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConteneurInput } from "@/lib/validations/trajet";

interface ConteneurSelectorProps {
  typeConteneurs: Array<{
    id: string;
    nom: string;
    taille_pieds: number;
    description?: string | null;
  }>;
  conteneurs: ConteneurInput[];
  onChange: (conteneurs: ConteneurInput[]) => void;
  error?: string;
  /** Si true, permet de modifier le statut des conteneurs (mode édition/retour) */
  isEditMode?: boolean;
}

export function ConteneurSelector({
  typeConteneurs,
  conteneurs,
  onChange,
  error,
  isEditMode = false,
}: ConteneurSelectorProps) {
  const [newConteneur, setNewConteneur] = useState<Partial<ConteneurInput>>({
    statut_livraison: "en_cours",
  });

  const handleAddConteneur = () => {
    if (!newConteneur.type_conteneur_id || !newConteneur.numero_conteneur) return;

    const conteneur: ConteneurInput = {
      type_conteneur_id: newConteneur.type_conteneur_id,
      numero_conteneur: newConteneur.numero_conteneur.trim().toUpperCase(),
      statut_livraison: newConteneur.statut_livraison || "en_cours",
    };

    onChange([...conteneurs, conteneur]);
    setNewConteneur({ statut_livraison: "en_cours" });
  };

  const handleRemoveConteneur = (index: number) => {
    onChange(conteneurs.filter((_, i) => i !== index));
  };

  const handleUpdateConteneur = (index: number, updates: Partial<ConteneurInput>) => {
    onChange(
      conteneurs.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  };

  const getTypeConteneur = (id: string) => {
    return typeConteneurs.find((t) => t.id === id);
  };

  // Compter les conteneurs par type
  const countByType = conteneurs.reduce((acc, c) => {
    const type = getTypeConteneur(c.type_conteneur_id);
    const key = type?.nom || "Inconnu";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div>
        <Label>Conteneurs</Label>
        <p className="text-sm text-muted-foreground">
          Ajoutez chaque conteneur individuellement avec son numéro unique
        </p>
      </div>

      {/* Résumé des conteneurs */}
      {conteneurs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(countByType).map(([type, count]) => (
            <Badge key={type} variant="outline" className="text-xs">
              {count}x {type}
            </Badge>
          ))}
          <Badge variant="secondary" className="text-xs">
            Total: {conteneurs.length} conteneur{conteneurs.length > 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Liste des conteneurs ajoutés */}
      {conteneurs.length > 0 && (
        <div className="space-y-2">
          {conteneurs.map((conteneur, index) => {
            const type = getTypeConteneur(conteneur.type_conteneur_id);
            return (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {conteneur.numero_conteneur}
                        </span>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {type?.nom || "?"} ({type?.taille_pieds}&apos;)
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isEditMode && (
                      <Select
                        value={conteneur.statut_livraison}
                        onValueChange={(value) =>
                          handleUpdateConteneur(index, {
                            statut_livraison: value as "en_cours" | "livre" | "retour",
                          })
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_cours">En cours</SelectItem>
                          <SelectItem value="livre">Livré</SelectItem>
                          <SelectItem value="retour">Retour</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveConteneur(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <Card className="p-3 border-dashed">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <Label htmlFor="type-conteneur">Type conteneur *</Label>
            <Select
              value={newConteneur.type_conteneur_id}
              onValueChange={(value) =>
                setNewConteneur({ ...newConteneur, type_conteneur_id: value })
              }
            >
              <SelectTrigger id="type-conteneur">
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                {typeConteneurs.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.nom} ({type.taille_pieds}&apos;)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nouveau-numero">Numéro conteneur *</Label>
            <Input
              id="nouveau-numero"
              value={newConteneur.numero_conteneur || ""}
              onChange={(e) =>
                setNewConteneur({ ...newConteneur, numero_conteneur: e.target.value })
              }
              placeholder="Ex: ABCD1234567"
              className="uppercase"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddConteneur}
            disabled={!newConteneur.type_conteneur_id || !newConteneur.numero_conteneur?.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {conteneurs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun conteneur ajouté. Ajoutez au moins un conteneur.
        </p>
      )}
    </div>
  );
}
