import apiClient from './apiClient';

class KelompokService {
    // ================== ADMIN FUNCTIONS ==================
    
    async getAllKelompok() {
        try {
            const response = await apiClient.get('/kelompok/admin/all');
            return response.data;
        } catch (error) {
            console.error('Error getting all kelompok:', error);
            throw error;
        }
    }

    async getKelompokById(id) {
        try {
            const response = await apiClient.get(`/kelompok/admin/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error getting kelompok by id:', error);
            throw error;
        }
    }

    async createKelompok(kelompokData) {
        try {
            const response = await apiClient.post('/kelompok/admin', kelompokData);
            return response.data;
        } catch (error) {
            console.error('Error creating kelompok:', error);
            throw error;
        }
    }

    async updateKelompok(id, kelompokData) {
        try {
            const response = await apiClient.put(`/kelompok/admin/${id}`, kelompokData);
            return response.data;
        } catch (error) {
            console.error('Error updating kelompok:', error);
            throw error;
        }
    }

    async deleteKelompok(id) {
        try {
            const response = await apiClient.delete(`/kelompok/admin/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting kelompok:', error);
            throw error;
        }
    }

    async toggleKelompokStatus(id) {
        try {
            const response = await apiClient.patch(`/kelompok/admin/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            console.error('Error toggling kelompok status:', error);
            throw error;
        }
    }

    async getKelompokStats() {
        try {
            const response = await apiClient.get('/kelompok/admin/stats');
            return response.data;
        } catch (error) {
            console.error('Error getting kelompok stats:', error);
            throw error;
        }
    }

    // ================== PUBLIC FUNCTIONS ==================
    
    async getKelompokDropdown() {
        try {
            const response = await apiClient.get('/kelompok/dropdown');
            return response.data;
        } catch (error) {
            console.error('Error getting kelompok dropdown:', error);
            throw error;
        }
    }
}

export default new KelompokService();
