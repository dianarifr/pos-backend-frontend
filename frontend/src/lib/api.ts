import type { AuthUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'pos_fullai_token';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(path: string, options: ApiOptions = {}, retry = true): Promise<T> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const query = params.toString();

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}${query ? `?${query}` : ''}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // Token kedaluwarsa/invalid: hapus dan paksa login ulang
  if (res.status === 401 && retry && !path.startsWith('/auth/login')) {
    clearToken();
    window.location.assign('/login');
    throw new ApiError('Sesi berakhir, silakan login ulang.', 401);
  }

  const json = (await res.json().catch(() => null)) as
    | (T & { message?: string; errors?: Record<string, string[]> })
    | null;

  if (!res.ok) {
    throw new ApiError(
      json?.message ?? 'Terjadi kesalahan pada server.',
      res.status,
      json?.errors,
    );
  }

  return json as T;
}

export function loginRequest(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  return request<{ token: string; user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: { email, password, device_name: 'web-kasir' },
  });
}

export function meRequest(): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>('/auth/me');
}

export function logoutRequest(): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/logout', { method: 'POST' });
}

export default request;
