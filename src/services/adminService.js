import apiClient from './apiClient.js';

// Get all pelanggan (Admin only)
export const getAllPelangganAdmin = async () => {
    try {
        const response = await apiClient.get('/pelanggan/admin/all');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Get user statistics (Admin only)
export const getUserStats = async () => {
    try {
        const response = await apiClient.get('/pelanggan/admin/stats');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// ================== USER MANAGEMENT ==================

// Get all users (Admin only)
export const getAllUsers = async () => {
    try {
        const response = await apiClient.get('/users');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Get user by ID (Admin only)
export const getUserById = async (id) => {
    try {
        const response = await apiClient.get(`/users/${id}`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Create single user (Admin only)
export const createUser = async (userData) => {
    try {
        const response = await apiClient.post('/users', userData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Create multiple users (bulk) (Admin only)
export const createBulkUsers = async (usersArray) => {
    try {
        const response = await apiClient.post('/users/bulk', { users: usersArray });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Update user (Admin only)
export const updateUser = async (id, userData) => {
    try {
        const response = await apiClient.put(`/users/${id}`, userData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Delete user (Admin only)
export const deleteUser = async (id) => {
    try {
        const response = await apiClient.delete(`/users/${id}`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Delete multiple users (bulk) (Admin only)
export const deleteBulkUsers = async (userIds) => {
    try {
        const response = await apiClient.delete('/users/bulk/delete', { data: { userIds } });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Toggle user active status (Admin only)
export const toggleUserStatus = async (id) => {
    try {
        const response = await apiClient.patch(`/users/${id}/toggle-status`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// ================== PELANGGAN ASSIGNMENT ==================

// Get available users for assignment (Admin only)
export const getAvailableUsers = async () => {
    try {
        const response = await apiClient.get('/pelanggan/admin/available-users');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Create pelanggan and assign to specific user (Admin only)
export const createPelangganForUser = async (pelangganData) => {
    try {
        const formData = new FormData();
        
        // Add all text fields
        Object.keys(pelangganData).forEach(key => {
            if (key !== 'foto_rumah' && pelangganData[key] !== null && pelangganData[key] !== undefined) {
                formData.append(key, pelangganData[key]);
            }
        });

        // Add file if exists
        if (pelangganData.foto_rumah) {
            formData.append('foto_rumah', pelangganData.foto_rumah);
        }

        const response = await apiClient.post('/pelanggan/admin/create-for-user', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Transfer pelanggan to different user (Admin only)
export const transferPelanggan = async (pelangganId, newUserId) => {
    try {
        const response = await apiClient.put(`/pelanggan/admin/transfer/${pelangganId}`, {
            new_user_id: newUserId
        });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

// Bulk assign multiple pelanggan to user (Admin only)
export const bulkAssignPelanggan = async (userId, pelangganIds) => {
    try {
        const response = await apiClient.put('/pelanggan/admin/bulk-assign', {
            user_id: userId,
            pelanggan_ids: pelangganIds
        });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};
