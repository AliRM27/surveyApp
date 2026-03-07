const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://localhost:7878/api';

type Options = RequestInit & { json?: unknown };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options,
    body: options.json ? JSON.stringify(options.json) : options.body
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  baseUrl: API_BASE,
  get: request,
  post: <T>(path: string, json: unknown) => request<T>(path, { method: 'POST', json })
};
