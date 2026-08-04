// src/lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL; // .env.local mein backend ka hosted URL

// generic fetch wrapper — har API call isi se guzregi
// src/lib/api.ts — UPDATE karo
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isFormData = options.body instanceof FormData; // O(1) — check: file upload hai ya normal JSON

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }), // FormData ho to yeh header hi mat lagao
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}

export default apiFetch;