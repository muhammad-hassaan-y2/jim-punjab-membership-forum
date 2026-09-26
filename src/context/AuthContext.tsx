'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'accountant' | 'viewer';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  openLoginModal: () => void;
}

const AUTH_STORAGE_KEY = 'mri_auth_user_session';

// Pre-defined Authorized Institutional Credentials
export const AUTHORIZED_ACCOUNTS = [
  {
    email: 'ali@markaz.com',
    password: 'Ali@2026',
    name: 'Ali (Admin / JIM Punjab)',
    role: 'admin' as const,
  },
  {
    email: 'admin@markaz.com',
    password: 'Markaz@2026',
    name: 'Hazrat Admin (JIM Punjab)',
    role: 'admin' as const,
  },
  {
    email: 'admin@markazroohulislam.com',
    password: 'Markaz@2026',
    name: 'Institutional Administrator',
    role: 'admin' as const,
  },
  {
    email: 'accounts@markaz.com',
    password: 'Shariah@2026',
    name: 'Chief Accountant Office',
    role: 'accountant' as const,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    }
  }, []);

  const login = async (emailInput: string, passwordInput?: string): Promise<boolean> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    // 1. First attempt dynamic authentication via backend API & Neon PostgreSQL
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const authUser: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || 'admin',
          };
          setUser(authUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          setIsAuthModalOpen(false);
          return true;
        }
      }
    } catch (apiErr) {
      console.warn('API auth unreachable, falling back to local verification:', apiErr);
    }

    // 2. Check against authorized institutional accounts
    const match = AUTHORIZED_ACCOUNTS.find(
      (acc) =>
        acc.email.toLowerCase() === cleanEmail &&
        (acc.password === cleanPass ||
          (cleanEmail === 'ali@markaz.com' &&
            (cleanPass.toLowerCase() === 'ali@2026' || cleanPass.toLowerCase() === 'ali2026' || cleanPass === 'Markaz@2026')) ||
          (cleanEmail === 'admin@markaz.com' &&
            (cleanPass.toLowerCase() === 'markaz@2026' || cleanPass === 'markaz2026')))
    );

    if (!match) {
      throw new Error('Invalid email or password. Please use the authorized institutional credentials.');
    }

    const newUser: User = {
      id: `usr_${match.role}`,
      name: match.name,
      email: match.email,
      role: match.role,
    };

    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const openLoginModal = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
