const BASE = '/agilmsg';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('agilmsg_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('agilmsg_token');
    localStorage.removeItem('agilmsg_user');
    localStorage.removeItem('agilmsg_org');
    window.location.href = `${BASE}/login`;
    throw new Error('Unauthorized');
  }

  return res;
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await request(path);
  return res.json();
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const res = await request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await request(path, { method: 'DELETE' });
  return res.json();
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('agilmsg_token');
}

export function getUser(): any {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('agilmsg_user');
  return raw ? JSON.parse(raw) : null;
}

export function getOrg(): any {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('agilmsg_org');
  return raw ? JSON.parse(raw) : null;
}

export function setAuth(token: string, user: any, org: any) {
  localStorage.setItem('agilmsg_token', token);
  localStorage.setItem('agilmsg_user', JSON.stringify(user));
  localStorage.setItem('agilmsg_org', JSON.stringify(org));
}

export function clearAuth() {
  localStorage.removeItem('agilmsg_token');
  localStorage.removeItem('agilmsg_user');
  localStorage.removeItem('agilmsg_org');
}
