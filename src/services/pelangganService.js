import apiClient from './apiClient.js';

export const getAllPelanggan = async () => {
    try {
        const response = await apiClient.get('/pelanggan');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

export const createPelanggan = async (formData) => {
    try {
        const response = await apiClient.post('/pelanggan', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

export const updatePelanggan = async (id, formData) => {
    try {
        const response = await apiClient.put(`/pelanggan/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

export const deletePelanggan = async (id) => {
    try {
        const response = await apiClient.delete(`/pelanggan/${id}`);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

export const getAvailableCabang = async () => {
    try {
        const response = await apiClient.get('/pelanggan/available-cabang');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

export const getAllPelangganAdmin = async () => {
    try {
        const response = await apiClient.get('/pelanggan/admin/all');
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};