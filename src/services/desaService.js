import apiClient from './apiClient.js';

// ================== DESA CRUD OPERATIONS (ADMIN ONLY) ==================

// Get all desa (Admin only)
export const getAllDesa = async () => {
    try {
        const response = await apiClient.get('/desa/admin/all');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Get desa by ID (Admin only)
export const getDesaById = async (id) => {
    try {
        const response = await apiClient.get(`/desa/admin/${id}`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Create new desa (Admin only)
export const createDesa = async (desaData) => {
    try {
        const response = await apiClient.post('/desa/admin', desaData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Update desa (Admin only)
export const updateDesa = async (id, desaData) => {
    try {
        const response = await apiClient.put(`/desa/admin/${id}`, desaData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Delete desa (Admin only)
export const deleteDesa = async (id) => {
    try {
        const response = await apiClient.delete(`/desa/admin/${id}`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Toggle desa active status (Admin only)
export const toggleDesaStatus = async (id) => {
    try {
        const response = await apiClient.patch(`/desa/admin/${id}/toggle-status`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Get desa statistics (Admin only)
export const getDesaStatistics = async () => {
    try {
        const response = await apiClient.get('/desa/admin/stats');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// ================== PUBLIC OPERATIONS ==================

// Get available desa for dropdown (Admin and User)
export const getAvailableDesa = async () => {
    try {
        const response = await apiClient.get('/desa/available');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};
