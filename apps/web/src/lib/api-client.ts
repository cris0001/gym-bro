// Base URL of the API. Override per environment via VITE_API_URL; defaults to
// the local API origin (which the API's CORS allows with credentials).
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Thrown on any non-2xx response, carrying the API's error envelope so callers
// (and forms) can switch on `code` or render field-level `details`.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface SuccessEnvelope<T> {
  data: T;
}

interface ErrorEnvelope {
  error: { message: string; code: string; details?: Record<string, string[]> };
}

// Typed fetch wrapper. credentials: 'include' sends/receives the HttpOnly auth
// cookie. Unwraps the { data } envelope on success; throws ApiError otherwise.
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...options?.headers },
  });

  const body: unknown = await res.json().catch(() => undefined);

  if (!res.ok) {
    const error = (body as ErrorEnvelope | undefined)?.error;
    throw new ApiError(
      res.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'Request failed',
      error?.details,
    );
  }

  return (body as SuccessEnvelope<T>).data;
}
