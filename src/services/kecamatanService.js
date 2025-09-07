import apiClient from './apiClient.js';

// ================== KECAMATAN CRUD OPERATIONS ==================

// Get all kecamatan (Admin only)
export const getAllKecamatan = async () => {
    try {
        const response = await apiClient.get('/kecamatan/admin/all');
        return { data: response.data.data, error: null };
    } catch (error) {
        console.error('Error getting all kecamatan:', error);
        return { data: null, error: error.response?.data?.error || 'Failed to fetch kecamatan data' };
    }
};

// Get kecamatan statistics (Admin only)
export const getKecamatanStatistics = async () => {
    try {
        const response = await apiClient.get('/kecamatan/admin/stats');
        return { data: response.data.summary, error: null };
    } catch (error) {
        console.error('Error getting kecamatan statistics:', error);
        return { data: null, error: error.response?.data?.error || 'Failed to fetch kecamatan statistics' };
    }
};

// Get kecamatan by ID (Admin only)
export const getKecamatanById = async (id) => {
    try {
        const response = await apiClient.get(`/kecamatan/admin/${id}`);
        return { data: response.data.data, error: null };
    } catch (error) {
        console.error('Error getting kecamatan by ID:', error);
        return { data: null, error: error.response?.data?.error || 'Failed to fetch kecamatan details' };
    }
};

// Create new kecamatan (Admin only)
export const createKecamatan = async (kecamatanData) => {
    try {
        const response = await apiClient.post('/kecamatan/admin', kecamatanData);
        return { data: response.data.data, error: null };
    } catch (error) {
        console.error('Error creating kecamatan:', error);
        return { data: null, error: error.response?.data?.error || 'Failed to create kecamatan' };
    }
};

// Update kecamatan (Admin only)
export const updateKecamatan = async (id, kecamatanData) => {
    try {
        const response = await apiClient.put(`/kecamatan/admin/${id}`, kecamatanData);
        return { data: response.data, error: null };
    } catch (error) {
        console.error('Error updating kecamatan:', error);
        return { data: null, error: error.response?.data?.error || 'Failed to update kecamatan' };
    }
};

// Delete kecamatan (Admin only)
export const deleteKecamatan = async (id) => {
    try {
        const response = await apiClient.delete(`/kecamatan/admin/${id}`);
        return { data: response.data, error: null };
    } catch (error) {
        console.error('Error deleting kecamatan:', error);
        return { data: null, error: error.response?.data?.error || 'Failed to delete kecamatan' };
    }
};

// Toggle kecamatan status (Admin only)
export const toggleKecamatanStatus = async (id) => {
    try {
        const response = await apiClient.patch(`/kecamatan/admin/${id}/toggle-status`);
        return { data: response.data, error: null };
    } catch (error) {
        console.error('Error toggling kecamatan status:', error);
        return { data: null, error: error.response?.data?.error || 'Failed to toggle kecamatan status' };
    }
};

// ================== PUBLIC/DROPDOWN OPERATIONS ==================

// Get available kecamatan for dropdown
export const getAvailableKecamatan = async () => {
    try {
        const response = await apiClient.get('/kecamatan/available');
        return { data: response.data.data, error: null };
    } catch (error) {
        console.error('Error getting available kecamatan:', error);
        return { data: null, error: error.response?.data?.error || 'Failed to fetch available kecamatan' };
    }
};

// Get kecamatan by desa ID for dynamic dropdown
export const getKecamatanByDesaId = async (desaId) => {
    try {
        const response = await apiClient.get(`/kecamatan/by-desa/${desaId}`);
        return { data: response.data.data, error: null };
    } catch (error) {
        console.error('Error getting kecamatan by desa:', error);
        return { data: null, error: error.response?.data?.error || 'Failed to fetch kecamatan for desa' };
    }
};
