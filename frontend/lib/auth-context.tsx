'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { captureSsoTokenFromUrl, fetchSession, getStoredToken, getTokenExpiry, redirectToConsole, renewLoanToken, SessionUser } from '@/lib/sso';

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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = (token: string) => {
      const expiresAt = getTokenExpiry(token);
      timer = setTimeout(async () => {
        try {
          const renewedToken = await renewLoanToken();
          if (!cancelled) schedule(renewedToken);
        } catch {
          if (!cancelled && Date.now() >= expiresAt) {
            redirectToConsole();
          } else if (!cancelled) {
            timer = setTimeout(() => schedule(token), 15_000);
          }
        }
      }, Math.max(1_000, expiresAt - Date.now() - 60_000));
    };

    const token = getStoredToken();
    if (token) schedule(token);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'loan.admin' ||
    user?.central_role?.includes('central.super_admin') ||
    user?.central_role?.includes('loan.admin');
  const hasPermission = (permission: string) =>
    isSuperAdmin || (user?.permissions?.includes(permission) ?? false);

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
