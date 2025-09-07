import apiClient from './apiClient.js';

// ================== CABANG CRUD OPERATIONS ==================

// Get all cabang (Admin only)
export const getAllCabang = async () => {
    try {
        const response = await apiClient.get('/cabang');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Get cabang by ID (Admin only)
export const getCabangById = async (id) => {
    try {
        const response = await apiClient.get(`/cabang/${id}`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Create new cabang (Admin only)
export const createCabang = async (cabangData) => {
    try {
        const response = await apiClient.post('/cabang', cabangData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Update cabang (Admin only)
export const updateCabang = async (id, cabangData) => {
    try {
        const response = await apiClient.put(`/cabang/${id}`, cabangData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Delete cabang (Admin only)
export const deleteCabang = async (id) => {
    try {
        const response = await apiClient.delete(`/cabang/${id}`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Toggle cabang active status (Admin only)
export const toggleCabangStatus = async (id) => {
    try {
        const response = await apiClient.patch(`/cabang/${id}/toggle-status`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// ================== USER-CABANG ASSIGNMENT ==================

// Get users without cabang (Admin only)
export const getUsersWithoutCabang = async () => {
    try {
        const response = await apiClient.get('/cabang/assignments/unassigned-users');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Assign user to cabang (Admin only)
export const assignUserToCabang = async (assignmentData) => {
    try {
        const response = await apiClient.post('/cabang/assignments/assign', assignmentData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Transfer user to different cabang (Admin only)
export const transferUserToCabang = async (transferData) => {
    try {
        const response = await apiClient.put('/cabang/assignments/transfer', transferData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Bulk assign multiple users to cabang (Admin only)
export const bulkAssignUsersToCabang = async (bulkData) => {
    try {
        const response = await apiClient.post('/cabang/assignments/bulk-assign', bulkData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};
