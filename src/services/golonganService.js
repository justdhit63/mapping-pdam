import apiClient from './apiClient';

const golonganService = {
    // Admin endpoints
    getAllGolongan: async () => {
        try {
            const response = await apiClient.get('/golongan/admin/all');
            return response.data;
        } catch (error) {
            console.error('Error getting all golongan:', error);
            throw error;
        }
    },

    getGolonganStats: async () => {
        try {
            const response = await apiClient.get('/golongan/admin/stats');
            return response.data;
        } catch (error) {
            console.error('Error getting golongan stats:', error);
            throw error;
        }
    },

    getGolonganById: async (id) => {
        try {
            const response = await apiClient.get(`/golongan/admin/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error getting golongan by id:', error);
            throw error;
        }
    },

    createGolongan: async (golonganData) => {
        try {
            const response = await apiClient.post('/golongan/admin', golonganData);
            return response.data;
        } catch (error) {
            console.error('Error creating golongan:', error);
            throw error;
        }
    },

    updateGolongan: async (id, golonganData) => {
        try {
            const response = await apiClient.put(`/golongan/admin/${id}`, golonganData);
            return response.data;
        } catch (error) {
            console.error('Error updating golongan:', error);
            throw error;
        }
    },

    deleteGolongan: async (id) => {
        try {
            const response = await apiClient.delete(`/golongan/admin/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting golongan:', error);
            throw error;
        }
    },

    toggleGolonganStatus: async (id) => {
        try {
            const response = await apiClient.patch(`/golongan/admin/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            console.error('Error toggling golongan status:', error);
            throw error;
        }
    },

    // Public endpoints
    getAvailableGolongan: async () => {
        try {
            const response = await apiClient.get('/golongan/dropdown');
            return response.data;
        } catch (error) {
            console.error('Error getting available golongan:', error);
            throw error;
        }
    }
};

export default golonganService;
