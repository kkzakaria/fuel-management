import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Page affichée quand l'utilisateur est hors ligne
 * et essaie d'accéder à une page non mise en cache
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <WifiOff className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Vous êtes hors ligne</CardTitle>
          <CardDescription className="text-base">
            Impossible de charger cette page sans connexion internet.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informations */}
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-lg">•</span>
              <span>
                Les pages déjà visitées sont disponibles dans le cache de votre
                navigateur.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">•</span>
              <span>
                Vous pouvez créer des trajets hors ligne. Ils seront
                automatiquement synchronisés quand vous retrouverez une
                connexion.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">•</span>
              <span>
                Cette application est optimisée pour fonctionner avec une
                connectivité instable en Côte d&apos;Ivoire.
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              className="w-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>

          {/* Conseils */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Conseils :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Vérifiez votre connexion internet</li>
              <li>• Essayez de vous rapprocher d&apos;une zone avec réseau</li>
              <li>• Activez les données mobiles si disponibles</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
