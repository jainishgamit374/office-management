// context/AuthContext.tsx
import {
  getUser,
  isAuthenticated,
  login as loginApi,
  LoginData,
  logout as logoutApi,
  register as registerApi,
  RegisterData,
  User,
} from '@/lib/auth';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const authenticated = await isAuthenticated();

      if (authenticated) {
        const userData = await getUser();
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginData) => {
    try {
      const response = await loginApi(credentials);

      // After successful login (tokens stored), fetch the user's profile
      const userProfile = await getUser();
      if (!userProfile) {
        // Try fetching from API if not present
        const fetched = await getUser();
        if (fetched) setUser(fetched);
      } else {
        setUser(userProfile);
      }

      setIsLoggedIn(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await registerApi(userData);
      // Don't auto-login after registration
      // User needs to verify email or manually login
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      setIsLoggedIn(false);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear state even if API fails
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};