const base = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
type Q = object;
export async function request<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {},
  query?: Q,
): Promise<T> {
  const p = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined) p.set(k, Array.isArray(v) ? v.join(",") : String(v));
  });
  const { body, headers, ...init } = options,
    form = body instanceof FormData,
    r = await fetch(base + path + (p.size ? "?" + p : ""), {
      ...init,
      headers: {
        ...(form ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : form ? body : JSON.stringify(body),
    }),
    payload: unknown = (r.headers.get("content-type") ?? "").includes("json")
      ? await r.json()
      : await r.text();
  if (!r.ok) {
    const e =
      payload && typeof payload === "object"
        ? (payload as { message?: string | string[] })
        : undefined;
    throw new ApiError(
      Array.isArray(e?.message)
        ? e.message.join(", ")
        : (e?.message ?? "API request failed"),
      r.status,
    );
  }
  return payload as T;
}
