

export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(params: { status: number; body: unknown; message?: string }) {
    super(params.message ?? `HTTP ${params.status}`);
    this.status = params.status;
    this.body = params.body;
  }
}

function buildUrl(baseUrl: string, path: string): string {
  let base = baseUrl;
  if (!base.endsWith("/")) base += "/";
  const relative = path.replace(/^\//, "");
  return new URL(relative, base).toString();
}

async function tryReadBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    const text = await res.text();
    return text.length ? text : null;
  } catch {
    return null;
  }
}

export async function postJson<TReq, TRes>(params: {
  baseUrl: string;
  path: string;
  body: TReq;
  headers?: Record<string, string>;
}): Promise<TRes> {
  const url = buildUrl(params.baseUrl, params.path);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(params.headers ?? {}),
    },
    body: JSON.stringify(params.body),
  });

  const parsed = await tryReadBody(res);

  if (!res.ok) {
    const message =
      typeof parsed === "object" && parsed != null && "error" in parsed
        ? String((parsed as { error: unknown }).error)
        : `HTTP ${res.status}`;
    throw new HttpError({ status: res.status, body: parsed, message });
  }

  return parsed as TRes;
}
