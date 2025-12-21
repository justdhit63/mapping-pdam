import { supabase } from '../lib/supabaseClient'

// ============================================
// PELANGGAN SERVICE
// ============================================

export const pelangganService = {
  // Get all pelanggan (with RLS: admin sees all, user sees own)
  getAll: async (filters = {}) => {
    let query = supabase
      .from('pelanggan')
      .select(`
        *,
        users:user_id (id, email, full_name),
        cabang:cabang_id (id, kode_unit, nama_unit),
        desa:desa_id (id, nama_desa),
        kecamatan:kecamatan_id (id, nama_kecamatan, kode_kecamatan),
        rayon:rayon_id (id, nama_rayon, kode_rayon),
        golongan:golongan_id (id, kode_golongan, nama_golongan),
        kelompok:kelompok_id (id, kode_kelompok, nama_kelompok)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.cabang_id) {
      query = query.eq('cabang_id', filters.cabang_id)
    }
    if (filters.status_pelanggan) {
      query = query.eq('status_pelanggan', filters.status_pelanggan)
    }
    if (filters.search) {
      query = query.or(`nama_pelanggan.ilike.%${filters.search}%,id_pelanggan.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get single pelanggan by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('pelanggan')
      .select(`
        *,
        users:user_id (id, email, full_name),
        cabang:cabang_id (id, kode_unit, nama_unit),
        desa:desa_id (id, nama_desa),
        kecamatan:kecamatan_id (id, nama_kecamatan, kode_kecamatan),
        rayon:rayon_id (id, nama_rayon, kode_rayon),
        golongan:golongan_id (id, kode_golongan, nama_golongan),
        kelompok:kelompok_id (id, kode_kelompok, nama_kelompok)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new pelanggan
  create: async (pelangganData) => {
    const { data, error } = await supabase
      .from('pelanggan')
      .insert(pelangganData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update pelanggan
  update: async (id, pelangganData) => {
    const { data, error } = await supabase
      .from('pelanggan')
      .update(pelangganData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete pelanggan
  delete: async (id) => {
    const { error } = await supabase
      .from('pelanggan')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Transfer pelanggan to another user
  transfer: async (pelangganId, newUserId) => {
    // Get pelanggan info before transfer
    const { data: pelanggan, error: fetchError } = await supabase
      .from('pelanggan')
      .select('nama_pelanggan, user_id, users:user_id(full_name)')
      .eq('id', pelangganId)
      .single()

    if (fetchError) throw fetchError

    // Get new user info
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', newUserId)
      .single()

    if (userError) throw userError

    // Update pelanggan user_id
    const { error: updateError } = await supabase
      .from('pelanggan')
      .update({ user_id: newUserId })
      .eq('id', pelangganId)

    if (updateError) throw updateError

    return {
      pelanggan: pelanggan.nama_pelanggan,
      from: pelanggan.users?.full_name || 'Unassigned',
      to: newUser.full_name
    }
  },

  // Bulk assign pelanggan to user
  bulkAssign: async (userId, pelangganIds) => {
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Update multiple pelanggan
    const { data, error } = await supabase
      .from('pelanggan')
      .update({ user_id: userId })
      .in('id', pelangganIds)
      .select()

    if (error) throw error

    return {
      affectedRows: data.length,
      assignedTo: user.full_name
    }
  },

  // Get statistics
  getStats: async () => {
    const { data, error } = await supabase
      .from('pelanggan')
      .select('status_pelanggan, cabang_id')

    if (error) throw error

    const stats = {
      total: data.length,
      aktif: data.filter(p => p.status_pelanggan === 'aktif').length,
      tidakAktif: data.filter(p => p.status_pelanggan === 'tidak aktif').length,
      byCabang: {}
    }

    data.forEach(p => {
      if (p.cabang_id) {
        stats.byCabang[p.cabang_id] = (stats.byCabang[p.cabang_id] || 0) + 1
      }
    })

    return stats
  }
}

// ============================================
// CABANG SERVICE
// ============================================

export const cabangService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('cabang')
      .select('*')
      .order('nama_unit', { ascending: true })

    if (error) throw error
    return data
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('cabang')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  create: async (cabangData) => {
    const { data, error } = await supabase
      .from('cabang')
      .insert(cabangData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  update: async (id, cabangData) => {
    const { data, error } = await supabase
      .from('cabang')
      .update(cabangData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('cabang')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  toggleStatus: async (id) => {
    // Get current status
    const { data: cabang } = await supabase
      .from('cabang')
      .select('is_active')
      .eq('id', id)
      .single()

    // Toggle status
    const { data, error } = await supabase
      .from('cabang')
      .update({ is_active: !cabang.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  getStatistics: async () => {
    const { data, error } = await supabase
      .from('cabang')
      .select('id')
      .eq('is_active', true)

    if (error) throw error
    return {
      total: data.length,
      active: data.length
    }
  }
}

// ============================================
// KECAMATAN SERVICE
// ============================================

export const kecamatanService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('kecamatan')
      .select('*')
      .order('nama_kecamatan', { ascending: true })

    if (error) throw error
    return data
  },

  create: async (kecamatanData) => {
    const { data, error } = await supabase
      .from('kecamatan')
      .insert(kecamatanData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  update: async (id, kecamatanData) => {
    const { data, error } = await supabase
      .from('kecamatan')
      .update(kecamatanData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('kecamatan')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  toggleStatus: async (id) => {
    // Get current status
    const { data: kecamatan } = await supabase
      .from('kecamatan')
      .select('is_active')
      .eq('id', id)
      .single()

    // Toggle status
    const { data, error } = await supabase
      .from('kecamatan')
      .update({ is_active: !kecamatan.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  getStatistics: async () => {
    const { data, error } = await supabase
      .from('kecamatan')
      .select('id')
      .eq('is_active', true)

    if (error) throw error
    return {
      total: data.length,
      active: data.length
    }
  },

  getByDesaId: async (desaId) => {
    // Get desa first to get kecamatan_id
    const { data: desaData, error: desaError } = await supabase
      .from('desa')
      .select('kecamatan_id')
      .eq('id', desaId)
      .single()

    if (desaError) throw desaError
    if (!desaData || !desaData.kecamatan_id) return null

    // Get kecamatan data
    const { data: kecamatanData, error: kecamatanError } = await supabase
      .from('kecamatan')
      .select('*')
      .eq('id', desaData.kecamatan_id)
      .single()

    if (kecamatanError) throw kecamatanError
    return kecamatanData
  }
}

// ============================================
// DESA SERVICE
// ============================================

export const desaService = {
  getAll: async (kecamatanId = null) => {
    let query = supabase
      .from('desa')
      .select('*, kecamatan:kecamatan_id(id, nama_kecamatan)')
      .order('nama_desa', { ascending: true })

    if (kecamatanId) {
      query = query.eq('kecamatan_id', kecamatanId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  create: async (desaData) => {
    const { data, error } = await supabase
      .from('desa')
      .insert(desaData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  update: async (id, desaData) => {
    const { data, error } = await supabase
      .from('desa')
      .update(desaData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('desa')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  toggleStatus: async (id) => {
    // Get current status
    const { data: desa } = await supabase
      .from('desa')
      .select('is_active')
      .eq('id', id)
      .single()

    // Toggle status
    const { data, error } = await supabase
      .from('desa')
      .update({ is_active: !desa.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  getStatistics: async () => {
    // Get desa data
    const { data: desaData, error: desaError } = await supabase
      .from('desa')
      .select('id, kecamatan_id')
      .eq('is_active', true)

    if (desaError) throw desaError
    
    // Get pelanggan data
    const { data: pelangganData, error: pelangganError } = await supabase
      .from('pelanggan')
      .select('id, desa_id')

    if (pelangganError) throw pelangganError
    
    // Count by kecamatan
    const byKecamatan = {}
    desaData.forEach(desa => {
      if (desa.kecamatan_id) {
        byKecamatan[desa.kecamatan_id] = (byKecamatan[desa.kecamatan_id] || 0) + 1
      }
    })

    const totalPelanggan = pelangganData.length
    const totalDesa = desaData.length

    return {
      summary: {
        total_desa: totalDesa,
        active_desa: totalDesa,
        total_pelanggan: totalPelanggan,
        avg_pelanggan_per_desa: totalDesa > 0 ? totalPelanggan / totalDesa : 0
      },
      byKecamatan
    }
  }
}

// ============================================
// RAYON SERVICE
// ============================================

export const rayonService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('rayon')
      .select('*')
      .order('nama_rayon', { ascending: true })

    if (error) throw error
    return data
  },

  create: async (rayonData) => {
    const { data, error } = await supabase
      .from('rayon')
      .insert(rayonData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  update: async (id, rayonData) => {
    const { data, error } = await supabase
      .from('rayon')
      .update(rayonData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('rayon')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  toggleRayonStatus: async (id) => {
    // Get current status
    const { data: rayon } = await supabase
      .from('rayon')
      .select('is_active')
      .eq('id', id)
      .single()

    // Toggle status
    const { data, error } = await supabase
      .from('rayon')
      .update({ is_active: !rayon.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  getStatistics: async () => {
    const { data, error } = await supabase
      .from('rayon')
      .select('id')
      .eq('is_active', true)

    if (error) throw error
    return {
      total: data.length,
      active: data.length
    }
  }
}

// ============================================
// GOLONGAN SERVICE
// ============================================

export const golonganService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('golongan')
      .select('*')
      .order('kode_golongan', { ascending: true })

    if (error) throw error
    return data
  },

  create: async (golonganData) => {
    const { data, error } = await supabase
      .from('golongan')
      .insert(golonganData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  update: async (id, golonganData) => {
    const { data, error } = await supabase
      .from('golongan')
      .update(golonganData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('golongan')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  toggleGolonganStatus: async (id) => {
    // Get current status
    const { data: golongan } = await supabase
      .from('golongan')
      .select('is_active')
      .eq('id', id)
      .single()

    // Toggle status
    const { data, error } = await supabase
      .from('golongan')
      .update({ is_active: !golongan.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  getStatistics: async () => {
    const { data, error } = await supabase
      .from('golongan')
      .select('id')
      .eq('is_active', true)

    if (error) throw error
    return {
      total: data.length,
      active: data.length
    }
  }
}

// ============================================
// KELOMPOK SERVICE
// ============================================

export const kelompokService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('kelompok')
      .select('*')
      .order('kode_kelompok', { ascending: true })

    if (error) throw error
    return data
  },

  create: async (kelompokData) => {
    const { data, error } = await supabase
      .from('kelompok')
      .insert(kelompokData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  update: async (id, kelompokData) => {
    const { data, error } = await supabase
      .from('kelompok')
      .update(kelompokData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('kelompok')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  toggleKelompokStatus: async (id) => {
    // Get current status
    const { data: kelompok } = await supabase
      .from('kelompok')
      .select('is_active')
      .eq('id', id)
      .single()

    // Toggle status
    const { data, error } = await supabase
      .from('kelompok')
      .update({ is_active: !kelompok.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  getStatistics: async () => {
    const { data, error } = await supabase
      .from('kelompok')
      .select('id')
      .eq('is_active', true)

    if (error) throw error
    return {
      total: data.length,
      active: data.length
    }
  }
}

// ============================================
// USERS SERVICE (for admin)
// ============================================

export const usersService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*, cabang:cabang_id(id, nama_unit)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*, cabang:cabang_id(id, nama_unit)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  create: async (userData) => {
    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name
        },
        emailRedirectTo: undefined, // Prevent email confirmation redirect
        // Note: To disable email confirmation for admin-created users:
        // 1. Go to Supabase Dashboard > Authentication > Email Auth
        // 2. Disable "Enable email confirmations"
        // OR use Admin API from backend (requires service role key)
      }
    })

    if (authError) {
      // Check if user already exists but not confirmed
      if (authError.message.includes('already registered')) {
        throw new Error('Email sudah terdaftar. Jika ini user baru, silakan konfirmasi email terlebih dahulu atau hubungi administrator.')
      }
      throw authError
    }

    // Wait a bit for auth to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create user profile in users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        position: userData.position,
        phone: userData.phone,
        cabang_id: userData.cabang_id || null,
        role: 'user',
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      // If insert fails, try to delete the auth user to prevent orphan
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError)
      }
      throw error
    }

    return data
  },

  createBulk: async (usersArray) => {
    const results = {
      createdUsers: [],
      errors: []
    }

    for (const user of usersArray) {
      try {
        const created = await usersService.create(user)
        results.createdUsers.push(created)
      } catch (error) {
        results.errors.push({ user, error: error.message })
      }
    }

    return results
  },

  update: async (id, userData) => {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id) => {
    // Get user auth_user_id first
    const { data: user } = await supabase
      .from('users')
      .select('auth_user_id')
      .eq('id', id)
      .single()

    // Delete from users table (this will cascade to pelanggan due to FK)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Delete from auth (optional, might need admin privileges)
    // await supabase.auth.admin.deleteUser(user.auth_user_id)

    return { deletedPelanggan: 0 } // Placeholder
  },

  deleteBulk: async (userIds) => {
    const results = {
      deletedUsers: [],
      totalDeletedPelanggan: 0,
      errors: []
    }

    for (const userId of userIds) {
      try {
        await usersService.delete(userId)
        results.deletedUsers.push(userId)
      } catch (error) {
        results.errors.push({ userId, error: error.message })
      }
    }

    return results
  },

  toggleStatus: async (id) => {
    // Get current status
    const { data: user } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', id)
      .single()

    // Toggle status
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  getStats: async () => {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role, is_active, cabang_id')

    if (usersError) throw usersError

    // Get all pelanggan
    const { data: pelanggan, error: pelangganError } = await supabase
      .from('pelanggan')
      .select('id, user_id, status_pelanggan')

    if (pelangganError) throw pelangganError

    const totalUsers = users.length
    const activeUsers = users.filter(u => u.is_active).length
    const adminUsers = users.filter(u => u.role === 'admin').length
    const regularUsers = users.filter(u => u.role === 'user').length
    const usersWithCabang = users.filter(u => u.cabang_id).length

    const totalPelanggan = pelanggan.length
    const activePelanggan = pelanggan.filter(p => p.status_pelanggan === 'aktif').length

    return {
      userStats: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admin: adminUsers,
        regular: regularUsers,
        withCabang: usersWithCabang
      },
      summary: {
        total_users: totalUsers,
        total_admins: adminUsers,
        total_regular_users: regularUsers,
        total_pelanggan: totalPelanggan,
        active_pelanggan: activePelanggan,
        inactive_pelanggan: totalPelanggan - activePelanggan
      }
    }
  },

  getUsersWithoutCabang: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .is('cabang_id', null)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  assignUserToCabang: async (userId, cabangId) => {
    const { data, error } = await supabase
      .from('users')
      .update({ cabang_id: cabangId })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  bulkAssignUsersToCabang: async (userIds, cabangId) => {
    const { data, error } = await supabase
      .from('users')
      .update({ cabang_id: cabangId })
      .in('id', userIds)
      .select()

    if (error) throw error
    return { affectedRows: data.length, assignedTo: `Cabang ${cabangId}` }
  }
}

// ============================================
// REGISTRATIONS SERVICE
// ============================================

export const registrationsService = {
  // Get all registrations
  getAll: async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        user:user_id (id, email, full_name),
        desa:desa_id (id, nama_desa),
        kecamatan:kecamatan_id (id, nama_kecamatan)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get pending registrations
  getPending: async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        user:user_id (id, email, full_name),
        desa:desa_id (id, nama_desa),
        kecamatan:kecamatan_id (id, nama_kecamatan)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new registration
  create: async (registrationData) => {
    const { data, error } = await supabase
      .from('registrations')
      .insert(registrationData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Approve registration
  approve: async (id, approvalData) => {
    // 1. Get registration data
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // 2. Create pelanggan from registration data
    const pelangganData = {
      user_id: registration.user_id,
      id_pelanggan: approvalData.id_pelanggan,
      nama_pelanggan: registration.nama_pelanggan,
      no_telpon: registration.no_telpon,
      alamat: registration.alamat,
      jumlah_jiwa: registration.jumlah_jiwa,
      latitude: registration.latitude,
      longitude: registration.longitude,
      foto_rumah_url: registration.foto_rumah_url,
      desa_id: registration.desa_id,
      kecamatan_id: registration.kecamatan_id,
      cabang_id: approvalData.cabang_id || registration.cabang_id,
      rayon_id: approvalData.rayon_id || registration.rayon_id,
      golongan_id: approvalData.golongan_id || registration.golongan_id,
      kelompok_id: approvalData.kelompok_id || registration.kelompok_id,
      jenis_meter: approvalData.jenis_meter,
      tanggal_pemasangan: approvalData.tanggal_pemasangan,
      distribusi: approvalData.distribusi,
      sumber: approvalData.sumber,
      kondisi_lingkungan: approvalData.kondisi_lingkungan,
      kategori: approvalData.kategori,
      status_pelanggan: 'aktif'
    }

    const { data: pelanggan, error: insertError } = await supabase
      .from('pelanggan')
      .insert(pelangganData)
      .select()
      .single()

    if (insertError) throw insertError

    // 3. Update registration status
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('registrations')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError
    
    return { registration: updatedRegistration, pelanggan }
  },

  // Reject registration
  reject: async (id, reason) => {
    const { data, error } = await supabase
      .from('registrations')
      .update({
        status: 'rejected',
        rejected_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
