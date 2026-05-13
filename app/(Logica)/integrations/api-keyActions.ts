"use server"
import { hashKey, getApiKey } from "./api-key";

/**
 * Obtiene el hash de la API key interna actual.
 */
export async function getApiKeyHashAction(): Promise<string> {
  return hashKey(getApiKey());
}