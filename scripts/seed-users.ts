import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'http://127.0.0.1:54321'
const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] || ''

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  { email: 'admin@transport.ci', password: 'Admin123!' },
  { email: 'gestionnaire@transport.ci', password: 'Gestion123!' },
  { email: 'chauffeur1@transport.ci', password: 'Chauffeur123!' },
  { email: 'chauffeur2@transport.ci', password: 'Chauffeur123!' },
  { email: 'personnel@transport.ci', password: 'Personnel123!' },
]

async function seedUsers() {
  console.log('Creating test users...')
  
  for (const user of testUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    })
    
    if (error) {
      console.error(`Error creating ${user.email}:`, error.message)
    } else {
      console.log(`Created user: ${user.email} (${data.user?.id})`)
    }
  }
  
  console.log('\nRunning create_test_profiles()...')
  const { error: rpcError } = await supabase.rpc('create_test_profiles')
  
  if (rpcError) {
    console.error('Error running create_test_profiles:', rpcError.message)
  } else {
    console.log('Test profiles created successfully!')
  }
  
  // Verify profiles
  const { data: profiles } = await supabase.from('profiles').select('email, role, is_active')
  console.log('\nProfiles:', profiles)
}

seedUsers()
