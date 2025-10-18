/**
 * Configuration next-safe-action
 * Instance sécurisée pour les Server Actions
 */

import { createSafeActionClient } from "next-safe-action";

/**
 * Client d'action sécurisé de base
 */
export const action = createSafeActionClient();

/**
 * Client d'action sécurisé avec authentification
 * Pour les actions nécessitant un utilisateur connecté
 */
export const authAction = createSafeActionClient({
  async middleware() {
    // TODO: Ajouter la vérification d'authentification
    // const session = await getSession();
    // if (!session) {
    //   throw new Error("Non authentifié");
    // }
    // return { userId: session.user.id };
    return {};
  },
});
