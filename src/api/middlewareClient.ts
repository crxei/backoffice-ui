const MIDDLEWARE_BASE = "https://middleware.flexcodelabs.com";
// const MIDDLEWARE_BASE = "http://localhost:4540";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${MIDDLEWARE_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok)
    throw new Error(
      `Middleware ${init?.method ?? "GET"} ${path} failed: ${res.status} ${res.statusText}`,
    );

  const contentType = res.headers.get("content-type") ?? "";
  if (res.status === 204 || !contentType.includes("application/json")) {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}

async function requestBlob(path: string): Promise<Blob> {
  const res = await fetch(`${MIDDLEWARE_BASE}${path}`);
  if (!res.ok)
    throw new Error(
      `Middleware GET ${path} failed: ${res.status} ${res.statusText}`,
    );
  return res.blob();
}

async function requestUpload<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${MIDDLEWARE_BASE}${path}`, {
    method: "POST",
    body,
  });
  if (!res.ok)
    throw new Error(
      `Middleware POST ${path} failed: ${res.status} ${res.statusText}`,
    );
  return res.json() as Promise<T>;
}

export const middlewareGet = <T>(path: string) => request<T>(path);
export const middlewarePost = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
export const middlewarePut = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PUT", body: JSON.stringify(body) });
export const middlewarePatch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const middlewareDelete = (path: string) =>
  request<void>(path, { method: "DELETE" });
export const middlewareDownload = (path: string) => requestBlob(path);
export const middlewareUpload = <T>(path: string, body: FormData) =>
  requestUpload<T>(path, body);
