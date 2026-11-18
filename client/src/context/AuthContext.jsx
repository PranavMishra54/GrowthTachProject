import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data.user);
      } catch (error) {
        if (error.response?.status !== 401) console.error('Unable to restore session:', error.userMessage);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const authenticate = useCallback(async (endpoint, credentials) => {
    const { data } = await api.post(endpoint, credentials);
    setUser(data.data.user);
    return data.data.user;
  }, []);
  const login = useCallback((credentials) => authenticate('/auth/login', credentials), [authenticate]);
  const adminLogin = useCallback((credentials) => authenticate('/auth/admin-login', credentials), [authenticate]);
  const register = useCallback((details) => authenticate('/auth/register', details), [authenticate]);
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, adminLogin, register, logout }), [
    user, loading, login, adminLogin, register, logout
  ]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
