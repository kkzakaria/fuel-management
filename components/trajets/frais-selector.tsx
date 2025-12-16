/**
 * Composant de sélection multiple de frais pour un trajet
 * Permet d'ajouter plusieurs frais avec libellé et montant
 */

"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { FraisInput } from "@/lib/validations/trajet";

// Suggestions de libellés courants
const LIBELLES_SUGGERES = [
  "Péage",
  "Manutention",
  "Stationnement",
  "Lavage",
  "Réparation",
  "Restauration",
  "Hébergement",
  "Communication",
];

interface FraisSelectorProps {
  frais: FraisInput[];
  onChange: (frais: FraisInput[]) => void;
  error?: string;
}

export function FraisSelector({ frais, onChange, error }: FraisSelectorProps) {
  const [newFrais, setNewFrais] = useState<Partial<FraisInput>>({
    libelle: "",
    montant: 0,
  });

  const handleAddFrais = () => {
    if (!newFrais.libelle || !newFrais.montant || newFrais.montant <= 0) return;

    const fraisItem: FraisInput = {
      libelle: newFrais.libelle.trim(),
      montant: newFrais.montant,
    };

    onChange([...frais, fraisItem]);
    setNewFrais({ libelle: "", montant: 0 });
  };

  const handleRemoveFrais = (index: number) => {
    onChange(frais.filter((_, i) => i !== index));
  };

  const handleUpdateFrais = (index: number, updates: Partial<FraisInput>) => {
    onChange(frais.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const handleSuggestionClick = (libelle: string) => {
    setNewFrais({ ...newFrais, libelle });
  };

  const totalFrais = frais.reduce((sum, f) => sum + f.montant, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Frais additionnels</Label>
        <p className="text-sm text-muted-foreground">
          Ajoutez les différents frais liés à ce trajet
        </p>
      </div>

      {/* Liste des frais ajoutés */}
      {frais.length > 0 && (
        <div className="space-y-2">
          {frais.map((item, index) => (
            <Card key={index} className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <Label htmlFor={`libelle-${index}`} className="text-xs">
                    Libellé
                  </Label>
                  <Input
                    id={`libelle-${index}`}
                    value={item.libelle}
                    onChange={(e) =>
                      handleUpdateFrais(index, { libelle: e.target.value })
                    }
                    placeholder="Type de frais"
                  />
                </div>
                <div>
                  <Label htmlFor={`montant-${index}`} className="text-xs">
                    Montant (XOF)
                  </Label>
                  <Input
                    id={`montant-${index}`}
                    type="number"
                    min="0"
                    step="100"
                    value={item.montant}
                    onChange={(e) =>
                      handleUpdateFrais(index, {
                        montant: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFrais(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Total */}
          <div className="rounded-lg bg-muted p-3 flex justify-between items-center">
            <span className="text-sm font-medium">Total des frais:</span>
            <span className="font-bold">{formatCurrency(totalFrais)}</span>
          </div>
        </div>
      )}

      {/* Suggestions de libellés */}
      {!newFrais.libelle && (
        <div className="flex flex-wrap gap-2">
          {LIBELLES_SUGGERES.map((libelle) => (
            <Button
              key={libelle}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(libelle)}
              className="text-xs"
            >
              {libelle}
            </Button>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <Card className="p-3 border-dashed">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <Label htmlFor="nouveau-libelle">Libellé du frais</Label>
            <Input
              id="nouveau-libelle"
              value={newFrais.libelle || ""}
              onChange={(e) =>
                setNewFrais({ ...newFrais, libelle: e.target.value })
              }
              placeholder="Ex: Péage, Manutention..."
            />
          </div>
          <div>
            <Label htmlFor="nouveau-montant">Montant (XOF)</Label>
            <Input
              id="nouveau-montant"
              type="number"
              min="0"
              step="100"
              value={newFrais.montant || ""}
              onChange={(e) =>
                setNewFrais({
                  ...newFrais,
                  montant: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddFrais}
            disabled={!newFrais.libelle || !newFrais.montant || newFrais.montant <= 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {frais.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Aucun frais ajouté. Cliquez sur une suggestion ou saisissez un libellé.
        </p>
      )}
    </div>
  );
}
