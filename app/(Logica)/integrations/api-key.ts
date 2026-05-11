import crypto from "crypto";
import process from "process";

const DEV_KEY = "uh_payments_dev_key_2026";

export function getApiKey(): string {
  return process.env.INTERNAL_API_KEY ?? DEV_KEY;
}

export function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex").toUpperCase();
}

export function getApiKeyHash(): string {
  return hashKey(getApiKey());
}

export function validateApiKey(request: Request): boolean {
  const receivedHash = request.headers.get("x-api-key-hash")?.trim().toUpperCase();
  return receivedHash === getApiKeyHash();
}

export function apiKeyResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized " }, { status: 401 });
}

import { NextResponse } from "next/server";