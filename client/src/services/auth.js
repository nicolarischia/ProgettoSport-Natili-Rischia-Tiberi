import axios from 'axios';

const API_URL = '/api';

export const register = async (username, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username,
            email,
            password
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Errore durante la registrazione' };
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // Assicuriamoci che l'oggetto utente includa isAdmin
            const userData = {
                ...response.data.user,
                isAdmin: response.data.user.isAdmin || false
            };
            localStorage.setItem('user', JSON.stringify(userData));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Errore durante il login' };
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

export const getToken = () => {
    return localStorage.getItem('token');
};

// Configurazione di axios per includere il token in tutte le richieste
axios.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
); 