const API_URL = import.meta.env.VITE_API_URL ?? '';

type RequestOptions = RequestInit & { auth?: boolean };

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, headers: customHeaders, ...requestOptions } = options;
  const headers = new Headers(customHeaders);
  if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please sign in to continue.');
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...requestOptions, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string | Array<{ message?: string }> } | null;
    const error = Array.isArray(payload?.error)
      ? payload.error.map((item) => item.message).filter(Boolean).join(', ')
      : payload?.error;
    throw new Error(error || `Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getStoredUser() {
  const value = localStorage.getItem('user');
  if (!value) return null;
  try {
    return JSON.parse(value) as import('./types').User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export function setSession(token: string, user: import('./types').User) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-change'));
}
