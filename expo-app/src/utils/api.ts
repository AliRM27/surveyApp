const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:7878/api";

//https://n3h703b4-7878.euw.devtunnels.ms/api

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

type Options = RequestInit & { json?: unknown };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
    body: options.json ? JSON.stringify(options.json) : options.body,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let message = `Request failed with ${res.status}`;

    try {
      if (contentType?.includes("application/json")) {
        const data = await res.json();
        message =
          (data as { message?: string; error?: string }).message ||
          (data as { error?: string }).error ||
          message;
      } else {
        const text = await res.text();
        if (text) message = text;
      }
    } catch (error) {
      console.warn("Failed to parse error response", error);
    }

    throw new Error(message);
  }
  return (await res.json()) as T;
}

export const api = {
  baseUrl: API_BASE,
  get: request,
  post: <T>(path: string, json: unknown) =>
    request<T>(path, { method: "POST", json }),
};
