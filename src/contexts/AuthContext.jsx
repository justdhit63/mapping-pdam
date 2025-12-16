import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, getUserProfile } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Load user profile if user exists
      if (session?.user) {
        loadUserProfile(session.user.id, session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      // Only reload on actual auth events, not on TOKEN_REFRESHED
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed, keeping existing profile')
        setSession(session)
        setUser(session?.user ?? null)
        return // Don't reload profile
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUserId, authUser) => {
    console.log('Loading profile for auth user:', authUserId)
    try {
      console.log('Calling getUserProfile with user object...')
      const userProfile = await getUserProfile(authUserId, authUser)
      console.log('✅ Profile loaded successfully:', userProfile)
      setProfile(userProfile)
      console.log('✅ Profile state updated')
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
      // Set minimal profile to prevent infinite loading
      setProfile({
        id: null,
        auth_user_id: authUserId,
        email: authUser?.email || '',
        full_name: 'User',
        role: 'user',
        is_active: true
      })
      console.log('✅ Fallback profile set')
    } finally {
      console.log('✅ Setting loading to FALSE')
      setLoading(false)
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  // Sign up new user
  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    if (error) throw error
    
    // Create user profile in users table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          auth_user_id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name || null,
          role: 'user', // Default role
          cabang_id: userData.cabang_id || null,
          position: userData.position || null,
          phone: userData.phone || null,
        })
      
      if (profileError) throw profileError
    }
    
    return data
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  // Reset password
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  // Update password
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  }

  // Update user profile
  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in')
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('auth_user_id', user.id)
    
    if (error) throw error
    
    // Reload profile
    await loadUserProfile(user.id)
  }

  // Check if user is admin (wrapped in useCallback to prevent re-renders)
  const isAdmin = useCallback(() => {
    return profile?.role === 'admin'
  }, [profile?.role])

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
