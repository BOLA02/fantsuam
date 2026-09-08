const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const CONSOLE_URL = process.env.NEXT_PUBLIC_CONSOLE_URL || "https://console.fantsuam.com.ng";
const IDENTITY_URL = process.env.NEXT_PUBLIC_IDENTITY_API_URL || "https://identity.fantsuam.com.ng/api";

let loanRenewal: Promise<string> | null = null;

export function getTokenExpiry(token: string): number {
  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    return Number(JSON.parse(atob(padded)).exp || 0) * 1000;
  } catch {
    return 0;
  }
}

export function renewLoanToken(): Promise<string> {
  if (loanRenewal) return loanRenewal;
  loanRenewal = fetch(`${IDENTITY_URL.replace(/\/$/, "")}/auth/service-token/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceKey: "loan" }),
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.accessToken) throw new Error(payload?.message || "Central session expired.");
      localStorage.setItem("token", payload.accessToken);
      return payload.accessToken as string;
    })
    .finally(() => {
      loanRenewal = null;
    });
  return loanRenewal;
}

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
  central_role: string[];
  permissions: string[];
}

export async function fetchSession(): Promise<SessionUser | null> {
  let token = getStoredToken();
  if (!token) return null;

  try {
    let res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      token = await renewLoanToken();
      res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        clearStoredToken();
        return null;
      }
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
