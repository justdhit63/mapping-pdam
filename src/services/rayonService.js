import apiClient from './apiClient';

const rayonService = {
    // Admin endpoints
    getAllRayon: async () => {
        try {
            const response = await apiClient.get('/rayon/admin/all');
            return response.data;
        } catch (error) {
            console.error('Error getting all rayon:', error);
            throw error;
        }
    },

    getRayonStats: async () => {
        try {
            const response = await apiClient.get('/rayon/admin/stats');
            return response.data;
        } catch (error) {
            console.error('Error getting rayon stats:', error);
            throw error;
        }
    },

    getRayonById: async (id) => {
        try {
            const response = await apiClient.get(`/rayon/admin/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error getting rayon by id:', error);
            throw error;
        }
    },

    createRayon: async (rayonData) => {
        try {
            const response = await apiClient.post('/rayon/admin', rayonData);
            return response.data;
        } catch (error) {
            console.error('Error creating rayon:', error);
            throw error;
        }
    },

    updateRayon: async (id, rayonData) => {
        try {
            const response = await apiClient.put(`/rayon/admin/${id}`, rayonData);
            return response.data;
        } catch (error) {
            console.error('Error updating rayon:', error);
            throw error;
        }
    },

    deleteRayon: async (id) => {
        try {
            const response = await apiClient.delete(`/rayon/admin/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting rayon:', error);
            throw error;
        }
    },

    toggleRayonStatus: async (id) => {
        try {
            const response = await apiClient.patch(`/rayon/admin/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            console.error('Error toggling rayon status:', error);
            throw error;
        }
    },

    // Public endpoints
    getAvailableRayon: async () => {
        try {
            const response = await apiClient.get('/rayon/dropdown');
            return response.data;
        } catch (error) {
            console.error('Error getting available rayon:', error);
            throw error;
        }
    }
};

export default rayonService;
