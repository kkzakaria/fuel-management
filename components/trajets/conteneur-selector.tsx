/**
 * Composant de sélection multiple de conteneurs pour un trajet
 * Permet d'ajouter plusieurs types de conteneurs avec leurs quantités
 */

"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
}

export function ConteneurSelector({
  typeConteneurs,
  conteneurs,
  onChange,
  error,
}: ConteneurSelectorProps) {
  const [newConteneur, setNewConteneur] = useState<Partial<ConteneurInput>>({
    quantite: 1,
    statut_livraison: "en_cours",
  });

  const handleAddConteneur = () => {
    if (!newConteneur.type_conteneur_id) return;

    const conteneur: ConteneurInput = {
      type_conteneur_id: newConteneur.type_conteneur_id,
      numero_conteneur: newConteneur.numero_conteneur || null,
      quantite: newConteneur.quantite || 1,
      statut_livraison: newConteneur.statut_livraison || "en_cours",
    };

    onChange([...conteneurs, conteneur]);
    setNewConteneur({ quantite: 1, statut_livraison: "en_cours" });
  };

  const handleRemoveConteneur = (index: number) => {
    onChange(conteneurs.filter((_, i) => i !== index));
  };

  const handleUpdateConteneur = (index: number, updates: Partial<ConteneurInput>) => {
    onChange(
      conteneurs.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  };

  const getTypeConteneurNom = (id: string) => {
    return typeConteneurs.find((t) => t.id === id)?.nom || "Inconnu";
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Conteneurs</Label>
        <p className="text-sm text-muted-foreground">
          Ajoutez les conteneurs transportés lors de ce trajet
        </p>
      </div>

      {/* Liste des conteneurs ajoutés */}
      {conteneurs.length > 0 && (
        <div className="space-y-2">
          {conteneurs.map((conteneur, index) => (
            <Card key={index} className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <Label className="text-xs">Type</Label>
                  <p className="text-sm font-medium">
                    {getTypeConteneurNom(conteneur.type_conteneur_id)}
                  </p>
                </div>
                <div>
                  <Label htmlFor={`numero-${index}`} className="text-xs">
                    Numéro (optionnel)
                  </Label>
                  <Input
                    id={`numero-${index}`}
                    value={conteneur.numero_conteneur || ""}
                    onChange={(e) =>
                      handleUpdateConteneur(index, { numero_conteneur: e.target.value })
                    }
                    placeholder="ABC123..."
                  />
                </div>
                <div>
                  <Label htmlFor={`quantite-${index}`} className="text-xs">
                    Quantité
                  </Label>
                  <Input
                    id={`quantite-${index}`}
                    type="number"
                    min="1"
                    max="10"
                    value={conteneur.quantite}
                    onChange={(e) =>
                      handleUpdateConteneur(index, {
                        quantite: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`statut-${index}`} className="text-xs">
                    Statut
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={conteneur.statut_livraison}
                      onValueChange={(value) =>
                        handleUpdateConteneur(index, {
                          statut_livraison: value as any,
                        })
                      }
                    >
                      <SelectTrigger id={`statut-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="livre">Livré</SelectItem>
                        <SelectItem value="retour">Retour</SelectItem>
                      </SelectContent>
                    </Select>
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
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <Card className="p-3 border-dashed">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <Label htmlFor="type-conteneur">Type conteneur</Label>
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
                    {type.nom} ({type.taille_pieds}')
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nouveau-numero">Numéro (optionnel)</Label>
            <Input
              id="nouveau-numero"
              value={newConteneur.numero_conteneur || ""}
              onChange={(e) =>
                setNewConteneur({ ...newConteneur, numero_conteneur: e.target.value })
              }
              placeholder="ABC123..."
            />
          </div>
          <div>
            <Label htmlFor="nouvelle-quantite">Quantité</Label>
            <Input
              id="nouvelle-quantite"
              type="number"
              min="1"
              max="10"
              value={newConteneur.quantite}
              onChange={(e) =>
                setNewConteneur({
                  ...newConteneur,
                  quantite: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>
          <Button
            type="button"
            onClick={handleAddConteneur}
            disabled={!newConteneur.type_conteneur_id}
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
