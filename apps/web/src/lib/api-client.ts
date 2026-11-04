import { MESSAGES } from '@/lib/i18n/messages';
import { useLocaleStore } from '@/stores/locale.store';

// Base URL of the API. Empty by default → requests use relative "/api/..." paths,
// so the browser always hits the SAME origin: the Vite dev-server proxy in dev
// (see vite.config.ts) and the same Fly app in production. VITE_API_URL is an
// optional override for pointing the SPA at a remote/absolute API.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Every request is abandoned after this long: on a weak gym connection a fetch can
// otherwise hang forever behind a spinner. Generous enough for a cold Neon start.
const REQUEST_TIMEOUT_MS = 15_000;

// Methods a server applies the same way however many times they arrive, so a lost
// response can be retried without side effects. A POST is retryable only when its
// caller makes it idempotent (a client-generated id — see `idempotent` below).
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE']);

// Thrown on any failed request, carrying the API's error envelope so callers (and
// forms) can switch on `code` or render field-level `details`. Transport failures
// use status 0 with code NETWORK_ERROR / TIMEOUT. `retryable` = the failure is
// transient (network, timeout, 5xx, 429) AND repeating the request is safe — the
// single flag the QueryClient's retry policy reads.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string[]>,
    readonly retryable = false,
    // Seconds from a Retry-After header (429 / 503), honoured by the retry delay.
    readonly retryAfterSeconds?: number,
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

export interface ApiFetchOptions extends RequestInit {
  // Marks a POST as safe to repeat (it carries a client-generated id the server
  // dedupes on). Other methods are classified by IDEMPOTENT_METHODS.
  idempotent?: boolean;
}

// Transport messages follow the UI language; read outside React from the store.
function networkMessages() {
  return MESSAGES[useLocaleStore.getState().locale].network;
}

// AbortSignal.any is recent (Safari 17.4, Chrome 116); fall back to a hand-wired
// controller so an older phone's PWA still gets both the caller's abort and the timeout.
function anySignal(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals);
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      controller.abort(s.reason);
      break;
    }
    s.addEventListener('abort', () => controller.abort(s.reason), { once: true });
  }
  return controller.signal;
}

function parseRetryAfter(res: Response): number | undefined {
  const header = res.headers.get('retry-after');
  if (!header) return undefined;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
}

// Typed fetch wrapper. credentials: 'include' sends/receives the HttpOnly auth
// cookie. Unwraps the { data } envelope on success; throws ApiError otherwise —
// including for a dropped connection or a request that exceeded the timeout.
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { idempotent, signal, ...init } = options;
  const method = (init.method ?? 'GET').toUpperCase();
  const safeToRepeat = idempotent ?? IDEMPOTENT_METHODS.has(method);
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'content-type': 'application/json', ...init.headers },
      signal: signal ? anySignal([signal, timeout]) : timeout,
    });
  } catch (error) {
    // A caller's own abort (e.g. TanStack Query cancelling a stale query) is not a
    // failure to report — rethrow it untouched.
    if (signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new ApiError(0, 'TIMEOUT', networkMessages().timeout, undefined, safeToRepeat);
    }
    throw new ApiError(0, 'NETWORK_ERROR', networkMessages().networkError, undefined, safeToRepeat);
  }

  const body: unknown = await res.json().catch(() => undefined);

  if (!res.ok) {
    const error = (body as ErrorEnvelope | undefined)?.error;
    const transient = res.status >= 500 || res.status === 429;
    throw new ApiError(
      res.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'Request failed',
      error?.details,
      transient && safeToRepeat,
      parseRetryAfter(res),
    );
  }

  return (body as SuccessEnvelope<T>).data;
}
