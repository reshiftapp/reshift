import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  console.log('1. Fetching Super Admin user...')
  const { data: userList } = await supabase.auth.admin.listUsers()
  const adminUser = userList?.users?.find(u => u.email === 'reshiftapp@gmail.com')

  if (!adminUser) {
    console.error('Super Admin auth user not found!')
    return
  }

  console.log('2. Updating auth metadata to include role: super_admin, approval_status: approved...')
  await supabase.auth.admin.updateUserById(adminUser.id, {
    user_metadata: {
      full_name: 'ReShift Super Admin',
      role: 'super_admin',
      approval_status: 'approved'
    }
  })

  console.log('3. Upserting into public.profiles for Super Admin...')
  const profileData = {
    id: adminUser.id,
    email: 'reshiftapp@gmail.com',
    full_name: 'ReShift Super Admin',
    role: 'Other',
    city: 'All'
  }

  const { data, error } = await supabase.from('profiles').upsert(profileData, { onConflict: 'id' }).select()
  if (error) {
    console.error('Error upserting profile:', error)
  } else {
    console.log('SUCCESS! Super admin profile saved:', data)
  }
}

main().catch(console.error)
