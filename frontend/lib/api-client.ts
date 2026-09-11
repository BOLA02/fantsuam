import { renewLoanToken } from './sso';

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
  const applicationAccessToken =
    typeof window === 'undefined' ? null : localStorage.getItem('mf_application_access_token');

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(applicationFeeToken ? { 'X-Application-Fee-Token': applicationFeeToken } : {}),
    ...(applicationAccessToken ? { 'X-Application-Access-Token': applicationAccessToken } : {}),
    ...options.headers,
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && token && typeof window !== 'undefined') {
    const renewedToken = await renewLoanToken();
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${renewedToken}` },
    });
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Server request execution failed.');
  }

  return payload;
}
