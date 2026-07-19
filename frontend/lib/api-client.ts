// lib/api-client.ts
// FULL FILE — UPDATED: skip JSON content-type/stringify handling for FormData bodies

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token: string | null = null;

  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    token = (await cookies()).get('token')?.value || null;
  } else {
    token = localStorage.getItem('token');
  }

  const applicationFeeToken =
    typeof window === 'undefined' ? null : localStorage.getItem('mf_application_fee_token');

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(applicationFeeToken ? { 'X-Application-Fee-Token': applicationFeeToken } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Server request execution failed.');
  }

  return payload;
}
