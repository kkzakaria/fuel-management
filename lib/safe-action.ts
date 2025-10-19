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
 *
 * TODO: Implémenter avec .use() pour next-safe-action v7+
 * Example:
 * export const authAction = action.use(async ({ next }) => {
 *   const session = await getSession();
 *   if (!session) {
 *     throw new Error("Non authentifié");
 *   }
 *   return next({ ctx: { userId: session.user.id } });
 * });
 */
export const authAction = action;
