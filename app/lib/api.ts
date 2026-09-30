const ALLOWED_HOSTS = ["localhost", "pasmthatfee.com", "albilaad-ksa.com"];
const ALLOWED_PREFIXES = [
  "/api/admin",
  "/api/products",
  "/api/checkout",
];

function getApiBase(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  const raw = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
  try {
    const { hostname } = new URL(raw);
    if (!ALLOWED_HOSTS.includes(hostname)) throw new Error(`Blocked host: ${hostname}`);
    return raw;
  } catch {
    return "http://localhost:5000";
  }
}

export const API = getApiBase();

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    throw new Error(`Blocked path: ${path}`);
  }
  const base = getApiBase();
  const url = base ? `${base}${path}` : path;
  return fetch(url, init);
}
