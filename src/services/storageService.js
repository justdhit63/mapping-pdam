import { supabase } from '../lib/supabaseClient'

// ============================================
// STORAGE SERVICE untuk Upload Foto
// ============================================

export const storageService = {
  /**
   * Upload foto rumah ke Supabase Storage
   * @param {File} file - File object dari input
   * @param {string} folder - Optional subfolder (default: root)
   * @returns {Promise<string>} Public URL dari file yang diupload
   */
  uploadFotoRumah: async (file, folder = '') => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload file
      const { data, error } = await supabase.storage
        .from('pelanggan-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pelanggan-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  /**
   * Delete foto dari Storage
   * @param {string} fileUrl - Full URL atau path dari file
   * @returns {Promise<void>}
   */
  deleteFoto: async (fileUrl) => {
    try {
      if (!fileUrl) return

      // Extract file path from URL
      // Format: https://xxx.supabase.co/storage/v1/object/public/pelanggan-images/filename.jpg
      const urlParts = fileUrl.split('/pelanggan-images/')
      if (urlParts.length < 2) {
        throw new Error('Invalid file URL format')
      }
      const filePath = urlParts[1]

      const { error } = await supabase.storage
        .from('pelanggan-images')
        .remove([filePath])

      if (error) throw error
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  },

  /**
   * Update foto (hapus yang lama, upload yang baru)
   * @param {File} newFile - File baru
   * @param {string} oldFileUrl - URL file lama yang akan dihapus
   * @param {string} folder - Optional subfolder
   * @returns {Promise<string>} Public URL dari file baru
   */
  updateFoto: async (newFile, oldFileUrl, folder = '') => {
    try {
      // Upload file baru
      const newUrl = await storageService.uploadFotoRumah(newFile, folder)

      // Hapus file lama jika ada
      if (oldFileUrl) {
        try {
          await storageService.deleteFoto(oldFileUrl)
        } catch (error) {
          console.warn('Failed to delete old file:', error)
          // Continue even if delete fails
        }
      }

      return newUrl
    } catch (error) {
      console.error('Error updating file:', error)
      throw error
    }
  },

  /**
   * Get public URL dari file path
   * @param {string} filePath - Path file di storage
   * @returns {string} Public URL
   */
  getPublicUrl: (filePath) => {
    const { data: { publicUrl } } = supabase.storage
      .from('pelanggan-images')
      .getPublicUrl(filePath)

    return publicUrl
  },

  /**
   * List semua file di bucket
   * @param {string} folder - Optional folder path
   * @returns {Promise<Array>} Array of files
   */
  listFiles: async (folder = '') => {
    try {
      const { data, error } = await supabase.storage
        .from('pelanggan-images')
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  },

  /**
   * Validate file sebelum upload
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {Object} { valid: boolean, error: string }
   */
  validateFile: (file, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    } = options

    if (!file) {
      return { valid: false, error: 'No file provided' }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB`,
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipe file tidak didukung. Gunakan: ${allowedTypes.join(', ')}`,
      }
    }

    return { valid: true, error: null }
  },
}

export default storageService
