import type { User } from "@/types";
const origin = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
let accessToken: string | null = null;
let refreshFlight: Promise<AuthResponse> | null = null;
let bootstrapFlight: Promise<AuthResponse> | null = null;
let authGeneration = 0;
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  verification_required: boolean;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public requestId?: string,
    public errors?: { path: string; message: string }[],
    public retryAfter?: string | null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export async function settleSessionOperations() {
  if (refreshFlight) await refreshFlight.catch(() => {});
}
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export function clearSession() {
  authGeneration++;
  accessToken = null;
  bootstrapFlight = null;
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("session-ended"));
}
export function apiUrl(path: string) {
  return `${origin}${path}`;
}
function expiresSoon(token: string) {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(part)).exp * 1000 < Date.now() + 30000;
  } catch {
    return true;
  }
}
async function readError(response: Response) {
  const data = await response.json().catch(() => ({}));
  return new ApiError(
    data.message ||
      (response.status === 404
        ? "The API is unavailable. Check your backend connection."
        : `Request failed (${response.status}).`),
    response.status,
    data.requestId,
    data.errors,
    response.headers.get("Retry-After"),
  );
}
export async function refreshSession(): Promise<AuthResponse> {
  if (refreshFlight) return refreshFlight;
  const generation = authGeneration;
  const run = async () => {
    const response = await fetch(apiUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Protection": "1" },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw await readError(response);
    const data = (await response.json()) as AuthResponse;
    if (generation !== authGeneration)
      throw new ApiError("Session changed. Please sign in again.", 401);
    accessToken = data.token;
    if (typeof window !== "undefined")
      window.dispatchEvent(
        new CustomEvent("session-user", { detail: data.user }),
      );
    return data;
  };
  // Web Locks serialize cookie rotation across tabs; the promise covers duplicate React effects.
  refreshFlight = (async () =>
    typeof navigator !== "undefined" && navigator.locks
      ? await navigator.locks.request("jobboard-session-refresh", run)
      : await run())()
    .catch((error) => {
      clearSession();
      throw error;
    })
    .finally(() => {
      refreshFlight = null;
    });
  return refreshFlight;
}
export function bootstrapSession() {
  return (bootstrapFlight ??= refreshSession());
}
async function request(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const publicAuth =
    /^\/api\/auth\/(login|register|forgot-password|reset-password|verify-email|verify-signup|resend-verification|logout)$/.test(
      endpoint,
    );
  if (!publicAuth && accessToken && expiresSoon(accessToken))
    await refreshSession();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (!publicAuth && accessToken)
    headers.set("Authorization", `Bearer ${accessToken}`);
  if (endpoint === "/api/auth/logout") headers.set("X-CSRF-Protection", "1");
  let response: Response;
  try {
    response = await fetch(apiUrl(endpoint), {
      ...options,
      credentials: "include",
      headers,
      cache: "no-store",
      signal: options.signal ?? AbortSignal.timeout(45000),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(
      options.method && options.method !== "GET"
        ? "Connection lost. This action may have completed. Reload its status before trying again."
        : "Cannot reach the backend. Start your API and check its address.",
    );
  }
  if (!response.ok) {
    const error = await readError(response);
    if (response.status === 401 && !publicAuth) clearSession();
    throw error;
  }
  return response;
}
export default async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await request(endpoint, options);
  if (response.status === 204) return undefined as T;
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(
      "The backend did not return an API response. Check your API URL.",
    );
  return response.json() as Promise<T>;
}
export async function downloadResume(id: string) {
  const response = await request(
    `/api/applications/${encodeURIComponent(id)}/resume`,
  );
  const blob = await response.blob();
  if (!blob.type.includes("pdf"))
    throw new ApiError("The server did not return a PDF.");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "application-resume.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export const json = (method: string, body: unknown = {}) => ({
  method,
  body: JSON.stringify(body),
});
export function errorMessage(error: unknown) {
  if (!(error instanceof Error))
    return "Something went wrong. Please try again.";
  const e = error as ApiError;
  return `${e.message}${e.errors?.length ? " " + e.errors.map((x) => `${x.path}: ${x.message}`).join(" · ") : ""}${e.retryAfter ? ` Try again after ${e.retryAfter} seconds.` : ""}${e.requestId ? ` Reference: ${e.requestId}` : ""}`;
}
export function passwordError(value: string) {
  return value.length < 12
    ? "Use at least 12 characters."
    : new TextEncoder().encode(value).length > 72
      ? "Password must be at most 72 UTF-8 bytes."
      : "";
}

export function safeReturnPath(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x1f]/.test(value)
  )
    return "/dashboard";
  try {
    const url = new URL(value, "https://jobboard.invalid");
    return url.origin === "https://jobboard.invalid"
      ? url.pathname + url.search
      : "/dashboard";
  } catch {
    return "/dashboard";
  }
}
