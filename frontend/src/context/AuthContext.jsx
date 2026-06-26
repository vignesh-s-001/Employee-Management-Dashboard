import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser } from '../api/auth';
import { setAuth, clearAuth, getStoredUser, isTokenValid, getToken } from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => isTokenValid() ? getStoredUser() : null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const isAuthenticated = Boolean(user);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      if (data.success) {
        setAuth(data.token, data.user);
        setUser(data.user);
        return { success: true };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name, email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(name, email, password, role);
      if (data.success) {
        setAuth(data.token, data.user);
        setUser(data.user);
        return { success: true };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setError(null);
  }, []);

  const token = getToken();

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
