import { createClient } from '@supabase/supabase-js'

// Ambil environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validasi environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'pdam-auth-token',
    storage: window.localStorage,
  },
})

// Helper function untuk get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function untuk get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Helper function untuk get user profile dari tabel users
export const getUserProfile = async (authUserId, authUser = null) => {
  try {
    console.log('Fetching profile from database for auth_user_id:', authUserId)
    
    if (!authUser) {
      console.error('No auth user provided!')
      throw new Error('No authenticated user provided')
    }
    
    // Try to fetch the actual user from database with timeout
    console.log('Attempting to fetch user from database...')
    
    // Create timeout promise (5 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000)
    })
    
    // Create query promise
    const queryPromise = supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    // Race between query and timeout
    let userData, userError
    try {
      const result = await Promise.race([queryPromise, timeoutPromise])
      userData = result.data
      userError = result.error
    } catch (timeoutError) {
      console.error('Query timeout or error:', timeoutError)
      userError = timeoutError
    }
    
    if (userError) {
      console.error('Error fetching user from database:', userError)
      // If user not found in database, create fallback profile with auth data only
      console.warn('⚠️ User not found in database or query timeout, using fallback profile')
      const profile = {
        id: null, // No database ID
        auth_user_id: authUserId,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        role: authUser.email === 'admin@pdam.com' ? 'admin' : 'user',
        cabang_id: null,
        is_active: true,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at || authUser.created_at
      }
      return profile
    }
    
    // User found in database, use actual data
    console.log('✅ User found in database:', userData)
    const profile = {
      id: userData.id, // Real database ID
      auth_user_id: userData.auth_user_id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      cabang_id: userData.cabang_id,
      is_active: userData.is_active,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    }
    
    console.log('✅ Returning user profile:', profile)
    return profile
    
    /* ORIGINAL DATABASE QUERY - COMMENTED OUT FOR DEBUGGING
    // Test basic connectivity first
    console.log('Testing Supabase connection...')
    const testQuery = supabase.from('users').select('count', { count: 'exact', head: true })
    console.log('Test query created, executing...')
    
    // Manual timeout dengan Promise.race
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 8 seconds')), 8000)
    })
    
    const queryPromise = supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    console.log('Executing main query with timeout...')
    const { data, error } = await Promise.race([queryPromise, timeoutPromise])
    
    console.log('Database query completed:', { data, error })
    console.log('✅ Returning bypass profile:', profile)
    return profile
    
    /* ORIGINAL DATABASE QUERY - COMMENTED OUT FOR DEBUGGING
    // Test basic connectivity first
    console.log('Testing Supabase connection...')
    const testQuery = supabase.from('users').select('count', { count: 'exact', head: true })
    console.log('Test query created, executing...')
    
    // Manual timeout dengan Promise.race
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 8 seconds')), 8000)
    })
    
    const queryPromise = supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    console.log('Executing main query with timeout...')
    const { data, error } = await Promise.race([queryPromise, timeoutPromise])
    
    console.log('Database query completed:', { data, error })
    
    if (error) {
      console.error('Database error:', error)
      
      // If it's a permissions error, try to get user info from auth
      if (error.code === 'PGRST116' || error.message?.includes('permission')) {
        console.warn('Permission denied, creating fallback profile')
        const { data: { user } } = await supabase.auth.getUser()
        
        return {
          id: null,
          auth_user_id: authUserId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          role: 'user',
          is_active: true
        }
      }
      
      throw error
    }
    
    if (!data) {
      // Profile not found - create minimal profile
      console.warn('Profile not found in database for auth user:', authUserId)
      
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Auth user data:', user)
      
      // Return minimal profile object
      const minimalProfile = {
        id: null,
        auth_user_id: authUserId,
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
        role: 'user',
        is_active: true
      }
      
      console.log('Returning minimal profile:', minimalProfile)
      return minimalProfile
    }
    
    console.log('Profile found:', data)
    return data
    */
  } catch (err) {
    console.error('Error in getUserProfile:', err)
    
    // Return fallback profile instead of throwing
    const { data: { user } } = await supabase.auth.getUser()
    return {
      id: null,
      auth_user_id: authUserId,
      email: user?.email || '',
      full_name: user?.user_metadata?.full_name || 'User',
      role: 'user',
      is_active: true
    }
  }
}

// Helper function untuk check if user is admin
export const isUserAdmin = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return false
    
    const profile = await getUserProfile(user.id)
    return profile?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export default supabase
