/**
 * persistentDb.ts
 *
 * File-based JSON store for offline fallback when MongoDB is unavailable.
 * Survives Next.js hot-module-reload and server restarts because data is
 * written to disk (orders_data.json in the project root) rather than held
 * in Node.js process memory.
 *
 * Performance improvements vs. original:
 *  - In-memory cache: reads are served from memory; disk is only hit when
 *    the cache is stale (>500 ms) — eliminates synchronous blocking reads
 *    on every API call.
 *  - Async writes: disk writes are fire-and-forget using fs.promises so the
 *    Node.js event loop is never blocked.
 *  - Write debouncing: rapid successive writes (e.g. from admin actions) are
 *    coalesced into a single disk flush 100 ms later.
 */

import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "orders_data.json");

interface PersistentStore {
  orders: any[];
  subscriptions: any[];
  customers: any[];
  inventoryStock: number;
}

const defaultStore: PersistentStore = {
  orders: [],
  subscriptions: [],
  customers: [],
  inventoryStock: 1500,
};

// ── In-memory cache ──────────────────────────────────────────────────────────
let memCache: PersistentStore | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 500; // treat cache as stale after 500 ms

// Debounce handle so rapid writes flush once
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function isCacheValid(): boolean {
  return memCache !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

function readStoreSync(): PersistentStore {
  // Hot path: return from in-memory cache
  if (isCacheValid()) return memCache!;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Partial<PersistentStore>;
      memCache = { ...defaultStore, ...parsed };
      cacheTimestamp = Date.now();
      return memCache;
    }
  } catch {
    // Corrupt file — start fresh
  }
  memCache = { ...defaultStore };
  cacheTimestamp = Date.now();
  return memCache;
}

/** Async fire-and-forget flush with 100 ms debounce */
function scheduleFlush(): void {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    if (!memCache) return;
    const snapshot = JSON.stringify(memCache, null, 2);
    fs.promises.writeFile(DATA_FILE, snapshot, "utf-8").catch((e) => {
      console.error("[persistentDb] Async write failed:", e);
    });
    flushTimer = null;
  }, 100);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getStore(): PersistentStore {
  return readStoreSync();
}

export function addOrder(order: any): void {
  const store = readStoreSync();
  if (!store.orders.find((o) => o.orderNumber === order.orderNumber)) {
    store.orders.unshift(order); // newest first
  }
  scheduleFlush();
}

export function addCustomer(customer: any): void {
  const store = readStoreSync();
  const idx = store.customers.findIndex(
    (c) => c.email.toLowerCase() === customer.email.toLowerCase()
  );
  if (idx === -1) {
    store.customers.push(customer);
  } else {
    store.customers[idx] = { ...store.customers[idx], ...customer };
  }
  scheduleFlush();
}

export function addSubscription(sub: any): void {
  const store = readStoreSync();
  if (!store.subscriptions.find((s) => s._id === sub._id)) {
    store.subscriptions.push(sub);
  }
  scheduleFlush();
}

export function updateOrderStatus(orderId: string, status: string): boolean {
  const store = readStoreSync();
  const idx = store.orders.findIndex((o) => o._id === orderId);
  if (idx === -1) return false;
  store.orders[idx].orderStatus = status;
  scheduleFlush();
  return true;
}

export function updateInventoryStock(stock: number): void {
  const store = readStoreSync();
  store.inventoryStock = Math.max(0, stock);
  scheduleFlush();
}

export function decrementInventory(): void {
  const store = readStoreSync();
  store.inventoryStock = Math.max(0, store.inventoryStock - 1);
  scheduleFlush();
}

export function resetStore(): void {
  memCache = { ...defaultStore };
  cacheTimestamp = Date.now();
  scheduleFlush();
}
