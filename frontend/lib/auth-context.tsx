'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { captureSsoTokenFromUrl, fetchSession, redirectToConsole, SessionUser } from '@/lib/sso';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      captureSsoTokenFromUrl();
      const session = await fetchSession();

      if (cancelled) return;

      if (!session) {
        redirectToConsole();
        return;
      }

      setUser(session);
      setLoading(false);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPermission = (permission: string) =>
    user?.permissions?.includes(permission) ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}