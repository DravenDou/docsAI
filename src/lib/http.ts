import { getServerEnv } from "@/src/lib/env";

const JSON_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
} as const;

export function jsonResponse<T>(body: T, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  for (const [key, value] of Object.entries(JSON_NO_STORE_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }

  return Response.json(body, {
    ...init,
    headers,
  });
}

export function jsonError(message: string, status = 400, headers?: HeadersInit) {
  return jsonResponse({ error: message }, { status, headers });
}

export function unauthorized() {
  return jsonError("Authentication required.", 401);
}

export function enforceSameOrigin(request: Request) {
  if (isSameOriginRequest(request)) return null;
  return jsonError("Invalid request origin.", 403);
}

export function rejectLargeRequest(request: Request, maxBytes: number) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return null;

  const parsed = Number.parseInt(contentLength, 10);
  if (Number.isNaN(parsed) || parsed <= maxBytes) return null;

  return jsonError("Request body is too large.", 413);
}

function isSameOriginRequest(request: Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const trustedOrigin = new URL(getServerEnv().BETTER_AUTH_URL).origin;
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return false;
  }

  const origin = request.headers.get("origin");
  if (origin) return originMatches(origin, trustedOrigin);

  const referer = request.headers.get("referer");
  if (referer) return originMatches(referer, trustedOrigin);

  // Browser requests normally include Origin or Sec-Fetch-Site for unsafe
  // methods. When both are absent, allow non-browser clients only after auth.
  return !secFetchSite;
}

function originMatches(value: string, trustedOrigin: string) {
  try {
    return new URL(value).origin === trustedOrigin;
  } catch {
    return false;
  }
}
