"use server";

import { getApiKeyHash } from "./api-key";

export async function getApiKeyHashAction(): Promise<string> {
  return getApiKeyHash();
}
