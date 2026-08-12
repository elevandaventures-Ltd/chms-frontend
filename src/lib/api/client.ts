/**
 * Typed client for the chms-backend Fastify API (separate service, default
 * http://localhost:3001).
 *
 * Auth: the backend verifies a Supabase access token sent as a Bearer header.
 * The frontend already holds a Supabase session (see lib/supabase/client), so
 * `apiFetch` pulls the current access token from it and attaches it
 * automatically. No token → the request is sent unauthenticated (the backend
 * will answer 401 for protected routes), surfaced here as an ApiError.
 */
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ApiErrorBody } from '@/lib/api/types';

/** Base URL of the Fastify backend. Trailing slash is trimmed. */
export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly body: unknown;
  constructor(status: number, code: string, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

/** Pull the current Supabase access token, or null when unauthenticated. */
export async function getAccessToken(): Promise<string | null> {
  const sb = getSupabaseBrowserClient();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  /** Plain object → JSON-encoded; FormData/string passed through untouched. */
  body?: unknown;
  /** Query params appended to the path. */
  query?: Record<string, string | number | boolean | undefined>;
  /** Skip attaching the bearer token (for public endpoints). */
  skipAuth?: boolean;
};

function buildUrl(path: string, query?: ApiFetchOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Core request helper. Returns the parsed JSON body typed as `T`, or throws an
 * ApiError on a non-2xx response / network failure.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, query, skipAuth, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isPlainBody = body !== undefined && !isFormData && typeof body !== 'string';

  if (isPlainBody && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      ...rest,
      headers: finalHeaders,
      body: isPlainBody ? JSON.stringify(body) : (body as BodyInit | undefined),
    });
  } catch (err) {
    throw new ApiError(0, 'NetworkError', err instanceof Error ? err.message : 'Network request failed');
  }

  // 204 / empty body.
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const errBody = data as Partial<ApiErrorBody> | undefined;
    throw new ApiError(
      res.status,
      errBody?.error ?? `HTTP_${res.status}`,
      errBody?.message ?? res.statusText ?? 'Request failed',
      data,
    );
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

/** Convenience verb helpers. */
export const api = {
  get:   <T>(path: string, opts?: ApiFetchOptions) => apiFetch<T>(path, { ...opts, method: 'GET' }),
  post:  <T>(path: string, body?: unknown, opts?: ApiFetchOptions) => apiFetch<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: ApiFetchOptions) => apiFetch<T>(path, { ...opts, method: 'PATCH', body }),
  put:   <T>(path: string, body?: unknown, opts?: ApiFetchOptions) => apiFetch<T>(path, { ...opts, method: 'PUT', body }),
  delete: <T>(path: string, opts?: ApiFetchOptions) => apiFetch<T>(path, { ...opts, method: 'DELETE' }),
};
