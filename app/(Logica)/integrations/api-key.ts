import crypto from "crypto";
import process from "process";



/**
 * Obtiene la API key interna.
 */
export function getApiKey(): string {
  return process.env.INTERNAL_API_KEY ?? "";
}

/**
 * Genera el hash sha256 en formato hex en mayusculas.
 */
export function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex").toUpperCase();
}

/**
 * Obtiene el hash de la API key interna actual.
 */
export function getApiKeyHash(): string {
  return hashKey(getApiKey());
}

/**
 * Valida el header x-api-key-hash contra la API key interna.
 */
export function validateApiKey(request: Request): boolean {
  const receivedHash = request.headers.get("x-api-key-hash")?.trim().toUpperCase();
  return receivedHash === getApiKeyHash();
}

/**
 * Respuesta estandar de no autorizado para APIs internas.
 */
export function apiKeyResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized " }, { status: 401 });
}

import { NextResponse } from "next/server";
