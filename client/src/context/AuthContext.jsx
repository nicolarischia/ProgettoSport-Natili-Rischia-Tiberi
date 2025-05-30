import { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, login as authLogin, register as authRegister, logout as authLogout } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Carica l'utente dal localStorage all'avvio
        const user = getCurrentUser();
        setUser(user);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authLogin(email, password);
        setUser(response.user);
        return response;
    };

    const register = async (username, email, password) => {
        const response = await authRegister(username, email, password);
        setUser(response.user);
        return response;
    };

    const logout = () => {
        authLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
    }
    return context;
}; 