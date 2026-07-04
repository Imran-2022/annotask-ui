'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { setAuthToken } from '@/services/apiClient';
import { AuthState, User } from '@/types';

interface AuthContextType extends Omit<AuthState, 'loadFromLocalStorage'> {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? window.localStorage.getItem('auth_user') : null;
    const storedAccess = typeof window !== 'undefined' ? window.localStorage.getItem('auth_access') : null;
    const storedRefresh = typeof window !== 'undefined' ? window.localStorage.getItem('auth_refresh') : null;

    if (storedUser && storedAccess) {
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      setIsAuthenticated(true);
      setAuthToken(storedAccess);
    }

    setIsInitialized(true);
  }, []);

  const saveAuth = (userData: User, access: string, refresh: string) => {
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);
    setIsAuthenticated(true);
    setAuthToken(access);

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_access', access);
      localStorage.setItem('auth_refresh', refresh);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setAuthToken(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_access');
      localStorage.removeItem('auth_refresh');
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      saveAuth(response.user, response.access, response.refresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    password2: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(username, email, password, password2);
      saveAuth(response.user, response.access, response.refresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const contextValue: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isInitialized,
    isLoading,
    error,
    login,
    register,
    logout,
    setUser,
    setError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
