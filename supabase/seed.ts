/**
 * Script de création des utilisateurs de test pour Supabase local
 *
 * Usage: pnpm seed:users
 *
 * Ce script:
 * 1. Supprime les utilisateurs de test existants (identifiés par @transport.ci)
 * 2. Crée les nouveaux utilisateurs avec les rôles appropriés
 * 3. Met à jour les profils via PostgreSQL directement
 *
 * Prérequis:
 * - Supabase local démarré (supabase start)
 * - Les migrations doivent être appliquées (supabase db reset)
 */

import { createClient } from "@supabase/supabase-js"
import pg from "pg"

const { Pool } = pg

// Configuration Supabase local (depuis supabase status)
const SUPABASE_URL =
  process.env["NEXT_PUBLIC_SUPABASE_URL"] || "http://127.0.0.1:54321"
const SUPABASE_SERVICE_ROLE_KEY =
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
  "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"

// Configuration PostgreSQL directe (pour bypasser les RLS)
const DATABASE_URL =
  process.env["DATABASE_URL"] ||
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

// Client Supabase pour l'authentification (création d'utilisateurs)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Pool PostgreSQL pour les opérations sur les tables (bypass RLS)
const pool = new Pool({ connectionString: DATABASE_URL })

// Types
type UserRole = "admin" | "gestionnaire" | "chauffeur" | "personnel"

interface TestUserConfig {
  email: string
  password: string
  role: UserRole
  nom: string
  prenom: string
  telephone?: string
  chauffeur_nom?: string
}

// Configuration des utilisateurs de test
const testUserConfigs: TestUserConfig[] = [
  {
    email: "admin@transport.ci",
    password: "Admin123!",
    role: "admin",
    nom: "Admin",
    prenom: "Système",
    telephone: "+225 07 00 00 00 01",
  },
  {
    email: "gestionnaire@transport.ci",
    password: "Gestion123!",
    role: "gestionnaire",
    nom: "Kouassi",
    prenom: "Jean-Marc",
    telephone: "+225 07 00 00 00 02",
  },
  {
    email: "chauffeur1@transport.ci",
    password: "Chauffeur123!",
    role: "chauffeur",
    nom: "Kouassi",
    prenom: "Jean-Baptiste",
    telephone: "+225 07 12 34 56 78",
    chauffeur_nom: "Kouassi Jean-Baptiste",
  },
  {
    email: "chauffeur2@transport.ci",
    password: "Chauffeur123!",
    role: "chauffeur",
    nom: "Coulibaly",
    prenom: "Mamadou",
    telephone: "+225 05 23 45 67 89",
    chauffeur_nom: "Coulibaly Mamadou",
  },
  {
    email: "personnel@transport.ci",
    password: "Personnel123!",
    role: "personnel",
    nom: "N'Guessan",
    prenom: "Christelle",
    telephone: "+225 27 20 00 00 03",
  },
]

// Map pour stocker les IDs des chauffeurs
let chauffeurMap: Map<string, string> = new Map()

/**
 * Récupère les IDs des chauffeurs depuis la base de données (via PostgreSQL)
 */
async function fetchChauffeurIds(): Promise<void> {
  console.log("📋 Récupération des chauffeurs existants...")

  try {
    const result = await pool.query(
      "SELECT id, nom, prenom FROM chauffeur"
    )

    if (result.rows.length === 0) {
      console.warn("⚠️ Aucun chauffeur trouvé dans la base de données")
      return
    }

    // Créer un mapping nom complet -> ID
    chauffeurMap = new Map(
      result.rows.map((c) => [`${c.nom} ${c.prenom}`, c.id])
    )

    console.log(`✅ ${result.rows.length} chauffeurs trouvés`)
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des chauffeurs:", error)
  }
}

/**
 * Supprime les utilisateurs de test existants
 */
async function deleteExistingTestUsers(): Promise<void> {
  console.log("🗑️ Suppression des utilisateurs de test existants...")

  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error("❌ Erreur lors de la liste des utilisateurs:", error)
    return
  }

  // Filtrer les utilisateurs de test (email se terminant par @transport.ci)
  const testUserIds = data.users
    .filter((u) => u.email?.endsWith("@transport.ci"))
    .map((u) => u.id)

  if (testUserIds.length === 0) {
    console.log("ℹ️ Aucun utilisateur de test existant à supprimer")
    return
  }

  console.log(`🔄 Suppression de ${testUserIds.length} utilisateurs...`)

  for (const userId of testUserIds) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error(`❌ Erreur lors de la suppression de ${userId}:`, deleteError)
    }
  }

  console.log("✅ Utilisateurs de test supprimés")
}

/**
 * Crée les utilisateurs de test
 */
async function createTestUsers(): Promise<void> {
  console.log("👤 Création des utilisateurs de test...")

  for (const userConfig of testUserConfigs) {
    console.log(`\n📝 Création de ${userConfig.email}...`)

    // Résoudre l'ID du chauffeur si nécessaire
    let chauffeurId: string | null = null
    if (userConfig.chauffeur_nom) {
      chauffeurId = chauffeurMap.get(userConfig.chauffeur_nom) || null
      if (!chauffeurId) {
        console.warn(
          `⚠️ Chauffeur "${userConfig.chauffeur_nom}" non trouvé, le profil ne sera pas lié`
        )
      }
    }

    // Créer l'utilisateur via l'API Admin Supabase
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: userConfig.email,
        password: userConfig.password,
        email_confirm: true,
        user_metadata: {
          nom: userConfig.nom,
          prenom: userConfig.prenom,
        },
      })

    if (authError) {
      console.error(`❌ Erreur lors de la création de ${userConfig.email}:`, authError)
      continue
    }

    if (!authData.user) {
      console.error(`❌ Utilisateur non créé pour ${userConfig.email}`)
      continue
    }

    console.log(`✅ Utilisateur créé: ${authData.user.id}`)

    // Mettre à jour le profil via PostgreSQL (bypass RLS)
    try {
      await pool.query(
        `UPDATE profiles
         SET role = $1, nom = $2, prenom = $3, telephone = $4, chauffeur_id = $5, is_active = true
         WHERE id = $6`,
        [
          userConfig.role,
          userConfig.nom,
          userConfig.prenom,
          userConfig.telephone || null,
          chauffeurId,
          authData.user.id,
        ]
      )
      console.log(`✅ Profil mis à jour: ${userConfig.role}`)
    } catch (profileError) {
      console.error(
        `❌ Erreur lors de la mise à jour du profil ${userConfig.email}:`,
        profileError
      )
    }
  }
}

/**
 * Affiche un résumé des utilisateurs créés
 */
async function printSummary(): Promise<void> {
  console.log("\n" + "=".repeat(60))
  console.log("📊 RÉSUMÉ DES UTILISATEURS DE TEST")
  console.log("=".repeat(60))

  try {
    const result = await pool.query(
      `SELECT email, role, nom, prenom, is_active
       FROM profiles
       WHERE email LIKE '%@transport.ci'
       ORDER BY role`
    )

    if (result.rows.length === 0) {
      console.log("⚠️ Aucun utilisateur de test trouvé")
      return
    }

    console.log("\n")
    console.log("┌─────────────────────────────────┬──────────────┬────────────────────┐")
    console.log("│ Email                           │ Rôle         │ Nom                │")
    console.log("├─────────────────────────────────┼──────────────┼────────────────────┤")

    for (const profile of result.rows) {
      const email = profile.email.padEnd(31)
      const role = profile.role.padEnd(12)
      const nom = `${profile.prenom} ${profile.nom}`.substring(0, 18).padEnd(18)
      console.log(`│ ${email} │ ${role} │ ${nom} │`)
    }

    console.log("└─────────────────────────────────┴──────────────┴────────────────────┘")

    console.log("\n📌 IDENTIFIANTS DE CONNEXION:")
    console.log("─".repeat(60))

    for (const user of testUserConfigs) {
      console.log(`   ${user.role.padEnd(12)} : ${user.email}`)
      console.log(`               Mot de passe: ${user.password}`)
      console.log("")
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des profils:", error)
  }
}

/**
 * Fonction principale
 */
async function main(): Promise<void> {
  console.log("\n")
  console.log("╔══════════════════════════════════════════════════════════╗")
  console.log("║     🚛 FUEL MANAGEMENT - SEED UTILISATEURS DE TEST      ║")
  console.log("╚══════════════════════════════════════════════════════════╝")
  console.log("\n")

  try {
    // Étape 1: Récupérer les chauffeurs existants
    await fetchChauffeurIds()

    // Étape 2: Supprimer les utilisateurs de test existants
    await deleteExistingTestUsers()

    // Étape 3: Créer les nouveaux utilisateurs
    await createTestUsers()

    // Étape 4: Afficher le résumé
    await printSummary()

    console.log("\n✅ Seed terminé avec succès!\n")
  } catch (error) {
    console.error("\n❌ Erreur fatale:", error)
    process.exit(1)
  } finally {
    // Fermer la connexion PostgreSQL
    await pool.end()
  }
}

// Exécuter le script
main()
