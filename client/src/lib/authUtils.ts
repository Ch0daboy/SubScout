import { supabase } from "../../../lib/supabase.js";

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function useAuthToken() {
  return {
    getAuthHeaders: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session ? { Authorization: `Bearer ${session.access_token}` } : {};
    }
  };
}

export async function apiRequestWithAuth(
  method: string,
  url: string,
  data?: unknown | undefined,
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}
