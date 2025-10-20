// src/services/registrationService.js
import apiClient from './apiClient';

export const createPelangganRegistration = async (formData) => {
    try {
        const response = await apiClient.post('/pelanggan/registration', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error creating registration');
    }
};

export const getAllRegistrations = async () => {
    try {
        const response = await apiClient.get('/pelanggan/registrations');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching registrations');
    }
};

export const getPendingRegistrations = async () => {
    try {
        const response = await apiClient.get('/pelanggan/registrations/pending');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching pending registrations');
    }
};

export const getRegistrationById = async (id) => {
    try {
        const response = await apiClient.get(`/pelanggan/registration/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching registration');
    }
};

export const approveRegistration = async (registrationId, approvalData) => {
    try {
        const response = await apiClient.patch(`/pelanggan/registration/${registrationId}/approve`, approvalData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error approving registration');
    }
};

export const rejectRegistration = async (registrationId, reason) => {
    try {
        const response = await apiClient.patch(`/pelanggan/registration/${registrationId}/reject`, {
            rejected_reason: reason
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error rejecting registration');
    }
};

export const updateRegistrationStatus = async (registrationId, status, data = {}) => {
    try {
        const response = await apiClient.patch(`/pelanggan/registration/${registrationId}/status`, {
            status,
            ...data
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error updating registration status');
    }
};

// Get registration statistics for admin dashboard
export const getRegistrationStats = async () => {
    try {
        const response = await apiClient.get('/pelanggan/registrations/stats');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching registration stats');
    }
};