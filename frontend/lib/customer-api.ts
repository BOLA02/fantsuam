const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'customerToken';

export type CustomerSession = {
  token: string;
  customer: { id: string; customerNumber: string; firstName: string; lastName: string; email: string };
};

export function saveCustomerSession(session: CustomerSession) { localStorage.setItem(TOKEN_KEY, session.token); }
export function clearCustomerSession() { localStorage.removeItem(TOKEN_KEY); }
export function hasCustomerSession() { return Boolean(localStorage.getItem(TOKEN_KEY)); }

export async function customerApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Request failed.');
  return payload;
}
