import { promises as fs } from "fs";
import path from "path";

export type StorageName =
  | "buyer_notifications"
  | "seller_notifications"
  | "products"
  | "product_reservations"
  | "quotes";

const DATA_DIR = path.join(process.cwd(), "docs", "mock-api-payments", "data");
const queues = new Map<string, Promise<unknown>>();

function filePath(name: StorageName): string {
  return path.join(DATA_DIR, `${name}.json`);
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readRaw(name: StorageName): Promise<string | null> {
  await ensureDir();
  try {
    return await fs.readFile(filePath(name), "utf8");
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === "ENOENT") return null;
    throw e;
  }
}

async function writeRaw(name: StorageName, content: string): Promise<void> {
  await ensureDir();
  await fs.writeFile(filePath(name), content, "utf8");
}

function queue<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = queues.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  queues.set(
    key,
    next.then(
      () => undefined,
      () => undefined,
    ),
  );
  return next;
}

export async function load<T = Record<string, unknown>>(
  name: StorageName,
): Promise<T[]> {
  const raw = await readRaw(name);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed as T[];
}

export async function save<T = Record<string, unknown>>(
  name: StorageName,
  items: T[],
): Promise<void> {
  await writeRaw(name, JSON.stringify(items, null, 2));
}

export async function append<T = Record<string, unknown>>(
  name: StorageName,
  item: T,
): Promise<void> {
  await queue(name, async () => {
    const items = await load<T>(name);
    items.push(item);
    await save(name, items);
  });
}

export async function findByField<T = Record<string, unknown>>(
  name: StorageName,
  field: string,
  value: string,
): Promise<T | null> {
  const items = await load<T>(name);
  for (const item of items) {
    const rec = item as Record<string, unknown>;
    if (rec[field] === value) return item;
  }
  return null;
}

export async function findFirstMatching<T = Record<string, unknown>>(
  name: StorageName,
  predicate: (item: T) => boolean,
): Promise<T | null> {
  const items = await load<T>(name);
  for (const item of items) {
    if (predicate(item)) return item;
  }
  return null;
}

export async function updateFirstMatching<T = Record<string, unknown>>(
  name: StorageName,
  predicate: (item: T) => boolean,
  patch: Partial<T>,
): Promise<T | null> {
  return queue(name, async () => {
    const items = await load<T>(name);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (predicate(item)) {
        const updated = { ...(item as Record<string, unknown>), ...(patch as Record<string, unknown>) } as T;
        items[i] = updated;
        await save(name, items);
        return updated;
      }
    }
    return null;
  });
}
