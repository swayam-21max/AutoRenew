import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem('autorenew_token') || localStorage.getItem('policypulse_token');
    const savedUser = localStorage.getItem('autorenew_user') || localStorage.getItem('policypulse_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('autorenew_token');
        localStorage.removeItem('autorenew_user');
        localStorage.removeItem('policypulse_token');
        localStorage.removeItem('policypulse_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('autorenew_token', token);
    localStorage.setItem('autorenew_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (fullName, email, password, confirmPassword) => {
    const response = await authAPI.register({ fullName, email, password, confirmPassword });
    const { token, user: userData } = response.data;
    localStorage.setItem('autorenew_token', token);
    localStorage.setItem('autorenew_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('autorenew_token');
    localStorage.removeItem('autorenew_user');
    localStorage.removeItem('policypulse_token');
    localStorage.removeItem('policypulse_user');
    setUser(null);
    window.location.href = '/';
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
