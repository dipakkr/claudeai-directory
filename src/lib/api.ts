const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Recursively transform MongoDB _id fields to id
function normalizeIds(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(normalizeIds);
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "_id") {
        result["id"] = value;
      } else {
        result[key] = normalizeIds(value);
      }
    }
    return result;
  }
  return data;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`API Error: ${status}`);
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        data = { detail: res.statusText };
      }
      throw new ApiError(res.status, data);
    }

    if (res.status === 204) return undefined as T;
    const json = await res.json();
    return normalizeIds(json) as T;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async del(endpoint: string): Promise<void> {
    return this.request<void>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();
