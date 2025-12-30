const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

function authHeaders() {
  const token = localStorage.getItem("token") ?? "";
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
}

async function parseBody(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function formatError(prefix: string, status: number, body: any) {
  const details = typeof body === "string" ? body : JSON.stringify(body, null, 2);
  return `${prefix} (${status})\n${details}`;
}

export async function fetchMessages(salonId: string) {
  const res = await fetch(`${API_URL}/api/salons/${salonId}/messages`, {
    headers: authHeaders(),
  });

  const body = await parseBody(res);
  if (!res.ok) throw new Error(formatError("fetchMessages failed", res.status, body));
  return body;
}

export async function sendMessage(salonId: string, content: string) {
  const res = await fetch(`${API_URL}/api/salons/${salonId}/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });

  const body = await parseBody(res);
  if (!res.ok) throw new Error(formatError("sendMessage failed", res.status, body));
  return body;
}