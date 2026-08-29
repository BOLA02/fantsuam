const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const CONSOLE_URL = process.env.NEXT_PUBLIC_CONSOLE_URL || "https://console.fantsuam.com.ng";

export function captureSsoTokenFromUrl(): void {
  if (typeof window === "undefined") return;

  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const token = fragment.get("sso");

  if (token) {
    localStorage.setItem("token", token);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

export function redirectToConsole(): void {
  window.location.href = CONSOLE_URL;
}

export interface SessionUser {
  firstName: string;
  lastName: string;
  role: string;
  employeeNumber: string;
  email: string;
  central_role: string;
  
  permissions: string[];
}

// Fetches the full /me payload once, for use in AuthContext.
// Unlike validateSession(), this keeps the data instead of discarding it.
export async function fetchSession(): Promise<SessionUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      clearStoredToken();
      return null;
    }

    if (!res.ok) return null;

    const json = await res.json();
    return (json.data ?? null) as SessionUser | null;
  } catch {
    return null;
  }
}

export async function validateSession(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      clearStoredToken();
      return false;
    }

    return res.ok;
  } catch {
    return false;
  }
}

export function logout(): void {
  clearStoredToken();
  redirectToConsole();
}