/**
 * Data-plane mode for Heimdall API clients.
 * mock (default) — session stores + simulated connectors
 * live — HTTP to HEIMDALL_API_BASE_URL + /api/v1/...
 */

export type DataPlaneMode = "mock" | "live";

export function getDataPlaneMode(): DataPlaneMode {
  const raw =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_HEIMDALL_DATA_PLANE ??
        process.env.HEIMDALL_DATA_PLANE
      : undefined;
  return raw === "live" ? "live" : "mock";
}

export function getApiBaseUrl(): string {
  if (typeof process === "undefined") return "";
  return (
    process.env.NEXT_PUBLIC_HEIMDALL_API_BASE_URL ??
    process.env.HEIMDALL_API_BASE_URL ??
    ""
  ).replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
