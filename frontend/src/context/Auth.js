import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { API_BASE_URL } from '../api';
const TOKEN_KEY = 'np_token';
const USER_KEY = 'np_user';

const AuthContext = createContext(null);

function loadAuth() {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        return token && user ? { token, user } : { token: null, user: null };
    } catch {
        return { token: null, user: null };
    }
}

export function AuthProvider({ children }) {
    const [{ token, user }, setAuth] = useState(loadAuth);

    // Attach the token to every request while logged in
    useEffect(() => {
        if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        else delete axios.defaults.headers.common.Authorization;
    }, [token]);

    const persist = useCallback((newToken, newUser) => {
        if (newToken) {
            localStorage.setItem(TOKEN_KEY, newToken);
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
        setAuth({ token: newToken || null, user: newUser || null });
    }, []);

    const register = useCallback(async (email, password, displayName) => {
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/register`, { email, password, displayName });
        persist(data.token, { email: data.email, displayName: data.displayName, admin: data.admin });
        return data;
    }, [persist]);

    const login = useCallback(async (email, password) => {
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
        persist(data.token, { email: data.email, displayName: data.displayName, admin: data.admin });
        return data;
    }, [persist]);

    const logout = useCallback(() => persist(null, null), [persist]);

    return (
        <AuthContext.Provider value={{ token, user, isAuthed: !!token, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
