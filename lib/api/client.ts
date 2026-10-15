import { toast } from "sonner";

/**
 * A tiny, axios-style fetch client used by every API service.
 *
 * Why this exists
 * ---------------
 * Every admin/store screen used to hand-roll `fetch`, duplicate JSON parsing,
 * re-implement error toasts and forget auth redirects. This client centralises
 * that so services stay one-liners:
 *
 *   const products = await productService.list();
 *
 * Features
 * --------
 *  - Request / response / error interceptors (push hooks, same idea as axios).
 *  - Unwraps the API envelope `{ success, data, error }` and returns `data`.
 *  - Auto error toasts (sonner) with a friendly, status-aware message.
 *  - 401 handling -> redirect to the admin login (skipped for the login call).
 *  - JSON *and* multipart FormData bodies (image upload, imports).
 *  - Per-call overrides: `silent`, `successMessage`, `fallbackError`,
 *    `redirectOn401`.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

export interface RequestConfig {
  url: string;
  method?: HttpMethod;
  /** Serialised into the query string; empty values are dropped. */
  params?: QueryParams;
  /** JSON body - automatically stringified with the right header. */
  data?: unknown;
  /** Multipart body - the browser sets the boundary header for us. */
  formData?: FormData;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Suppress the automatic success/error toasts. */
  silent?: boolean;
  /** Message shown when the request fails and the server gives none. */
  fallbackError?: string;
  /** Message shown as a success toast on a 2xx response. */
  successMessage?: string;
  /** Set `false` to keep the 401 interceptor from redirecting (e.g. login). */
  redirectOn401?: boolean;
}

/** Callers only ever pass these - `url`/`method` are filled in per helper. */
export type RequestOptions = Omit<RequestConfig, "url" | "method">;

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  pages?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type RequestInterceptor = (
  config: RequestConfig,
) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (
  envelope: ApiEnvelope,
) => ApiEnvelope | Promise<ApiEnvelope>;
type ErrorInterceptor = (error: ApiError) => void | Promise<void>;

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "/api";

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

function buildUrl(url: string, params?: QueryParams): string {
  const base = /^https?:\/\//i.test(url) ? "" : DEFAULT_BASE_URL;
  const path = url.startsWith("/") ? url : `/${url}`;
  const full = `${base}${path}`;

  if (!params) return full;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  }

  const qs = search.toString();
  return qs ? `${full}?${qs}` : full;
}

function buildInit(config: RequestConfig): RequestInit {
  const headers: Record<string, string> = { ...config.headers };
  let body: BodyInit | undefined;

  if (config.formData) {
    // Let the browser choose the correct multipart boundary.
    body = config.formData;
  } else if (config.data !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(config.data);
  }

  return {
    method: config.method ?? "GET",
    headers,
    body,
    signal: config.signal,
    credentials: "same-origin",
  };
}

function statusMessage(status: number, config: RequestConfig): string {
  if (config.fallbackError) return config.fallbackError;
  if (status === 0) return "Network error. Please check your connection.";
  if (status === 400) return "Please check the submitted fields.";
  if (status === 401) return "You are not authorized to do that.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "The requested item was not found.";
  if (status === 429) return "Too many requests. Please slow down.";
  if (status >= 500) return "Server error. Please try again shortly.";
  return "Something went wrong.";
}

/** Redirects to the admin login unless the caller opted out. */
function handleUnauthorized(config: RequestConfig): boolean {
  if (config.redirectOn401 === false) return false;
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/admin/login")) return false;

  toast.error("Your session has expired. Please sign in again.");
  // Session expiry needs a hard navigation to reset in-memory auth state,
  // so we intentionally bypass the Next.js router here. This module is a
  // plain fetch utility (not a Component), so `useRouter()`/`redirect()`
  // cannot be used. Build an absolute URL - external/absolute destinations
  // are allowed by `@next/no-location-assign-relative-destination`.
  const loginUrl = new URL("/admin/login", window.location.origin).href;
  window.location.assign(loginUrl);
  return true;
}

async function request<T = unknown>(
  config: RequestConfig,
): Promise<ApiEnvelope<T>> {
  let resolved: RequestConfig = { method: "GET", ...config };

  for (const interceptor of requestInterceptors) {
    resolved = await interceptor(resolved);
  }

  let response: Response;
  try {
    response = await fetch(
      buildUrl(resolved.url, resolved.params),
      buildInit(resolved),
    );
  } catch {
    const error = new ApiError(
      "Network error. Please check your connection.",
      0,
    );
    if (!resolved.silent)
      toast.error(resolved.fallbackError ?? error.message);
    for (const interceptor of errorInterceptors) await interceptor(error);
    throw error;
  }

  let envelope: ApiEnvelope = { success: true };
  try {
    const text = await response.text();
    if (text) envelope = JSON.parse(text) as ApiEnvelope;
  } catch {
    envelope = { success: false };
  }

  for (const interceptor of responseInterceptors) {
    envelope = await interceptor(envelope);
  }

  const ok = response.ok && envelope.success !== false;
  if (!ok) {
    const message =
      (typeof envelope.error === "string" && envelope.error) ||
      statusMessage(response.status, resolved);
    const error = new ApiError(message, response.status, envelope);

    if (response.status === 401) {
      const redirected = handleUnauthorized(resolved);
      if (!redirected && !resolved.silent)
        toast.error(resolved.fallbackError ?? message);
    } else if (!resolved.silent) {
      toast.error(resolved.fallbackError ?? message);
    }

    for (const interceptor of errorInterceptors) await interceptor(error);
    throw error;
  }

  if (!resolved.silent && resolved.successMessage)
    toast.success(resolved.successMessage);

  return envelope as ApiEnvelope<T>;
}

export const api = {
  /** Returns the unwrapped `data` payload. */
  get<T = unknown>(url: string, options: RequestOptions = {}) {
    return request<T>({ ...options, url, method: "GET" }).then(
      (e) => e.data as T,
    );
  },
  post<T = unknown>(url: string, options: RequestOptions = {}) {
    return request<T>({ ...options, url, method: "POST" }).then(
      (e) => e.data as T,
    );
  },
  put<T = unknown>(url: string, options: RequestOptions = {}) {
    return request<T>({ ...options, url, method: "PUT" }).then(
      (e) => e.data as T,
    );
  },
  patch<T = unknown>(url: string, options: RequestOptions = {}) {
    return request<T>({ ...options, url, method: "PATCH" }).then(
      (e) => e.data as T,
    );
  },
  delete<T = unknown>(url: string, options: RequestOptions = {}) {
    return request<T>({ ...options, url, method: "DELETE" }).then(
      (e) => e.data as T,
    );
  },
  /** Returns the full envelope (for endpoints that also return total/pages). */
  getEnvelope<T = unknown>(url: string, options: RequestOptions = {}) {
    return request<T>({ ...options, url, method: "GET" });
  },
  /** Register a request interceptor; returns an unsubscribe function. */
  onRequest(interceptor: RequestInterceptor) {
    requestInterceptors.push(interceptor);
    return () => {
      const i = requestInterceptors.indexOf(interceptor);
      if (i >= 0) requestInterceptors.splice(i, 1);
    };
  },
  /** Register a response interceptor (runs on every parsed envelope). */
  onResponse(interceptor: ResponseInterceptor) {
    responseInterceptors.push(interceptor);
    return () => {
      const i = responseInterceptors.indexOf(interceptor);
      if (i >= 0) responseInterceptors.splice(i, 1);
    };
  },
  /** Register an error interceptor (runs on every thrown ApiError). */
  onError(interceptor: ErrorInterceptor) {
    errorInterceptors.push(interceptor);
    return () => {
      const i = errorInterceptors.indexOf(interceptor);
      if (i >= 0) errorInterceptors.splice(i, 1);
    };
  },
};

/** Alias so imports read as `import { apiFetch } from "@/lib/api"`. */
export const apiFetch = api;
export default api;

