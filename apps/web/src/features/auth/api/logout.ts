import { apiFetch } from '@/lib/api-client';

// POST /api/auth/logout — clears the auth cookie server-side. Returns nothing
// useful, so we discard the { success: true } payload.
export async function logout(): Promise<void> {
  await apiFetch<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
}
