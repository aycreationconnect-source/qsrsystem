const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const configuredUrl = import.meta.env.VITE_API_URL || '/api';

// On mobile/tablets accessing via LAN IP, 'localhost' points to the phone itself.
// Always route via '/api' (same-origin Vite proxy) when accessing from external devices.
export const API_BASE_URL = (!isLocalhost && configuredUrl.includes('localhost'))
  ? '/api'
  : configuredUrl;

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('pos_jwt_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    credentials: 'include',
    headers,
    ...options,
  });

  if (!response.ok) {
    let errorMsg = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData?.message) {
        errorMsg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
      }
    } catch {
      // fallback to generic HTTP error message
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
