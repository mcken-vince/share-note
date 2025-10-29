'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/AuthService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const cookieToken = getCookie('auth-token');
    if (cookieToken) {
      const tokenString = cookieToken as string;
      setToken(tokenString);
      // Verify token with backend
      AuthService.verifyToken(tokenString)
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            deleteCookie('auth-token');
            setToken(null);
          }
        })
        .catch(() => {
          deleteCookie('auth-token');
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await AuthService.login({ email, password });
    setCookie('auth-token', data.token, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    setToken(data.token);
    setUser(data.user);
    router.push('/notes');
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    const data = await AuthService.signup({ firstName, lastName, email, password });
    setCookie('auth-token', data.token, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    setToken(data.token);
    setUser(data.user);
    router.push('/notes');
  };

  const logout = () => {
    deleteCookie('auth-token');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    const token = getCookie('auth-token');
    if (!token) return;

    try {
      const data = await AuthService.verifyToken(token as string);
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, signup, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
