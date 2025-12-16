/**
 * Seed Users Script
 *
 * Creates test users using Supabase Admin API.
 * Run after `supabase db reset` with:
 *   pnpm tsx scripts/seed-users.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable or uses local default.
 */

import { createClient } from '@supabase/supabase-js'

// Local Supabase defaults
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'http://127.0.0.1:54321'
const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test users configuration
const testUsers = [
  {
    email: 'admin@transport.ci',
    password: 'Test123!',
    role: 'admin' as const,
    nom: 'Admin',
    prenom: 'Système',
    telephone: '+225 27 20 00 00 01'
  },
  {
    email: 'gestionnaire@transport.ci',
    password: 'Test123!',
    role: 'gestionnaire' as const,
    nom: 'Diaby',
    prenom: 'Aminata',
    telephone: '+225 27 20 00 00 02'
  },
  {
    email: 'chauffeur1@transport.ci',
    password: 'Test123!',
    role: 'chauffeur' as const,
    nom: 'Kouassi',
    prenom: 'Jean-Baptiste',
    telephone: '+225 07 12 34 56 78',
    linkToChauffeur: true
  },
  {
    email: 'chauffeur2@transport.ci',
    password: 'Test123!',
    role: 'chauffeur' as const,
    nom: 'Coulibaly',
    prenom: 'Mamadou',
    telephone: '+225 05 23 45 67 89',
    linkToChauffeur: true
  },
  {
    email: 'personnel@transport.ci',
    password: 'Test123!',
    role: 'personnel' as const,
    nom: "N'Guessan",
    prenom: 'Christelle',
    telephone: '+225 27 20 00 00 03'
  },
  {
    email: 'visiteur@transport.ci',
    password: 'Test123!',
    role: 'visiteur' as const,
    nom: 'Demo',
    prenom: 'Utilisateur',
    telephone: '+225 00 00 00 00 00'
  },
]

async function seedUsers() {
  console.log('🌱 Starting user seed...\n')
  console.log(`📡 Supabase URL: ${supabaseUrl}`)

  // Create users
  for (const user of testUsers) {
    console.log(`\n👤 Creating ${user.email}...`)

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        nom: user.nom,
        prenom: user.prenom
      }
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`   ⚠️  User already exists, skipping...`)
        continue
      }
      console.error(`   ❌ Error: ${error.message}`)
      continue
    }

    console.log(`   ✅ Created with ID: ${data.user?.id}`)

    // Update profile with role and details using RPC to bypass RLS
    if (data.user) {
      // Find chauffeur_id if needed
      let chauffeurId = null
      if (user.linkToChauffeur) {
        const { data: chauffeurs } = await supabase
          .from('chauffeur')
          .select('id')
          .eq('nom', user.nom)
          .eq('prenom', user.prenom)

        chauffeurId = chauffeurs?.[0]?.id || null
      }

      // Update profile directly (service_role bypasses RLS)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: user.role,
          nom: user.nom,
          prenom: user.prenom,
          telephone: user.telephone,
          chauffeur_id: chauffeurId,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.user.id)

      if (profileError) {
        console.error(`   ❌ Profile update error: ${profileError.message}`)
      } else {
        console.log(`   ✅ Profile updated (role: ${user.role})`)
      }
    }
  }

  // Update chauffeur statuses for dashboard testing
  console.log('\n🚗 Updating chauffeur statuses...')

  const statusUpdates = [
    { noms: ['Kouassi', 'Coulibaly', 'Touré'], statut: 'actif' },
    { noms: ['Koné', 'Bamba'], statut: 'en_voyage' },
    { noms: ['Sangaré'], statut: 'en_conge' },
    { noms: ['Diallo'], statut: 'suspendu' },
    { noms: ["N'Guessan"], statut: 'inactif' },
  ]

  for (const update of statusUpdates) {
    const { error } = await supabase
      .from('chauffeur')
      .update({ statut: update.statut })
      .in('nom', update.noms)

    if (error) {
      console.error(`   ❌ Error updating ${update.statut}: ${error.message}`)
    } else {
      console.log(`   ✅ Set ${update.noms.join(', ')} to ${update.statut}`)
    }
  }

  // Add extra chauffeurs for better status distribution
  console.log('\n➕ Adding extra chauffeurs for status diversity...')

  const extraChauffeurs = [
    { nom: 'Traoré', prenom: 'Oumar', telephone: '+225 07 11 22 33 44', numero_permis: 'CI-AB-111111', date_embauche: '2022-02-01', statut: 'actif' },
    { nom: 'Soro', prenom: 'Abdoulaye', telephone: '+225 05 22 33 44 55', numero_permis: 'CI-AB-222222', date_embauche: '2021-08-15', statut: 'actif' },
    { nom: 'Yao', prenom: 'Koffi', telephone: '+225 01 33 44 55 66', numero_permis: 'CI-AB-333333', date_embauche: '2020-05-20', statut: 'en_voyage' },
    { nom: 'Aka', prenom: 'Bernard', telephone: '+225 07 44 55 66 77', numero_permis: 'CI-AB-444444', date_embauche: '2019-12-10', statut: 'en_voyage' },
    { nom: 'Gnagne', prenom: 'Patrick', telephone: '+225 05 55 66 77 88', numero_permis: 'CI-AB-555555', date_embauche: '2021-03-25', statut: 'en_conge' },
    { nom: 'Mensah', prenom: 'Kofi', telephone: '+225 01 66 77 88 99', numero_permis: 'CI-AB-666666', date_embauche: '2018-07-01', statut: 'suspendu' },
  ]

  for (const chauffeur of extraChauffeurs) {
    const { error } = await supabase
      .from('chauffeur')
      .upsert(chauffeur, { onConflict: 'numero_permis' })

    if (error) {
      console.error(`   ❌ Error adding ${chauffeur.nom}: ${error.message}`)
    }
  }
  console.log(`   ✅ Added ${extraChauffeurs.length} extra chauffeurs`)

  // Final summary
  console.log('\n📊 Final chauffeur status distribution:')
  const { data: stats } = await supabase
    .from('chauffeur_status_stats')
    .select('*')

  if (stats) {
    for (const stat of stats) {
      console.log(`   ${stat.statut}: ${stat.count} (${stat.percentage}%)`)
    }
  }

  console.log('\n✅ Seed complete!')
  console.log('\n📋 Test credentials:')
  console.log('   All users: Test123!')
  console.log('   Emails: admin@transport.ci, gestionnaire@transport.ci, etc.')
}

seedUsers().catch(console.error)
