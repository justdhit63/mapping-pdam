import apiClient from './apiClient.js';

export const login = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data || error.message };
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
    try {
        // Cek apakah ada token di localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }

        // Ambil data user lengkap dari server
        const response = await apiClient.get('/auth/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        // Jika gagal ambil dari server, fallback ke localStorage
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

// Fungsi tambahan untuk mendapatkan user dari localStorage saja (untuk keperluan sinkron)
export const getCurrentUserFromStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const isAdmin = async () => {
    try {
        const user = await getCurrentUser();
        return user && user.role === 'admin';
    } catch (error) {
        // Fallback ke localStorage
        const user = getCurrentUserFromStorage();
        return user && user.role === 'admin';
    }
};

export const getUserRole = async () => {
    try {
        const user = await getCurrentUser();
        return user ? user.role : null;
    } catch (error) {
        // Fallback ke localStorage
        const user = getCurrentUserFromStorage();
        return user ? user.role : null;
    }
};

export const getToken = () => {
    return localStorage.getItem('token');
};