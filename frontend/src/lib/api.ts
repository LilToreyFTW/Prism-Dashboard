import type { AuthMode, AuthResponse, BuilderRequest, DashboardPayload, LicenseDuration, LicenseKeyRecord } from '../types/api';

const httpBase = import.meta.env.VITE_API_BASE_URL ?? '';
const wsBase = import.meta.env.VITE_WS_BASE_URL ?? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export const dashboardSocketUrl = `${wsBase}/ws/dashboard`;

export async function fetchDashboard(): Promise<DashboardPayload> {
  const response = await fetch(`${httpBase}/api/dashboard`);
  if (!response.ok) {
    throw new Error('Unable to load dashboard data.');
  }
  return response.json();
}

export async function authenticate(mode: AuthMode, payload: Record<string, string | boolean>): Promise<AuthResponse> {
  const response = await fetch(`${httpBase}/auth/${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: 'Authentication failed.' }));
    throw new Error(data.detail ?? 'Authentication failed.');
  }
  return response.json();
}

export async function generateProject(request: BuilderRequest): Promise<Blob> {
  const response = await fetch(`${httpBase}/generate/${request.language}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: 'Generation failed.' }));
    throw new Error(data.detail ?? 'Generation failed.');
  }
  return response.blob();
}

export async function generateLicenseKeys(payload: { duration: LicenseDuration; count: number; note?: string; adminToken?: string }): Promise<LicenseKeyRecord[]> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (payload.adminToken) {
    headers['X-Prism-Admin-Token'] = payload.adminToken;
  }
  const response = await fetch(`${httpBase}/api/licenses/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ duration: payload.duration, count: payload.count, note: payload.note })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: 'License generation failed.' }));
    throw new Error(data.detail ?? 'License generation failed.');
  }
  return response.json();
}
