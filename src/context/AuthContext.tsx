import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthUser } from '@/types';
import * as authService from '@/services/authService';
import type { LoginInput, RegisterInput } from '@/services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  updateProfile: (
  input: authService.UpdateProfileInput,
) => Promise<AuthUser>;
changePassword: (
  input: authService.ChangePasswordInput,
) => Promise<string>;
  logout: () => Promise<void>;
  
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Synchronous today (localStorage), but kept async-shaped so this
    // becomes a real `/api/auth/me` call without touching callers.
    setUser(authService.getCurrentUser());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const authedUser = await authService.login(input);
    setUser(authedUser);
    return authedUser;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const authedUser = await authService.register(input);
    setUser(authedUser);
    return authedUser;
  }, []);

  const updateProfile = useCallback(
  async (input: authService.UpdateProfileInput) => {
    const updatedUser = await authService.updateProfile(input);
    setUser(updatedUser);
    return updatedUser;
  },
  [],
);

const changePassword = useCallback(
  async (input: authService.ChangePasswordInput) => {
    return authService.changePassword(input);
  },
  [],
);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
