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
    email: 'admin@markaz.com',
    password: 'Markaz@2026',
    name: 'Hazrat Admin (مرکز روح الاسلام)',
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

    // Check against authorized institutional accounts
    const match = AUTHORIZED_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === cleanPass
    );

    if (!match) {
      // Also allow if user types admin@markaz.com with lowercase/relaxed password variant
      if (cleanEmail === 'admin@markaz.com' && (cleanPass === 'markaz2026' || cleanPass === 'Markaz@2026')) {
        const newUser: User = {
          id: 'usr_admin',
          name: 'Hazrat Admin (مرکز روح الاسلام)',
          email: 'admin@markaz.com',
          role: 'admin',
        };
        setUser(newUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        setIsAuthModalOpen(false);
        return true;
      }
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
