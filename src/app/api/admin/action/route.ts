import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Product from "@/models/Product";
import {
  getStore,
  updateOrderStatus,
  updateInventoryStock,
  addSubscription,
  addCustomer,
} from "@/lib/persistentDb";

// ── Cache bust helper ─────────────────────────────────────────────────────────
// Zeroes the globalThis flag that stats route reads; next poll will miss cache
// and fetch fresh data immediately after any mutation.

/** Race DB connect against a short timeout so actions never hang */
async function tryConnect(timeoutMs = 1500): Promise<boolean> {
  try {
    await Promise.race([
      connectToDatabase(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`DB timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

/** Bust the in-process stats cache so the next poll gets fresh data */
function bustStatsCache() {
  (globalThis as any).__statsCacheTs = 0;
}

/**
 * Run a DB write with a per-operation timeout.
 * The file store is ALWAYS updated first; this is a best-effort Atlas sync.
 */
async function safeDbWrite(fn: () => Promise<any>, timeoutMs = 2000): Promise<void> {
  try {
    await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`DB write timed out (${timeoutMs}ms)`)), timeoutMs)
      ),
    ]);
  } catch (e: any) {
    // Best-effort only — file store already has the update
    console.warn("[action] DB write skipped:", e.message);
  }
}

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    // File store is always authoritative — DB is best-effort sync
    const dbConnected = await tryConnect();

    if (action === "updateOrderStatus") {
      const { orderId, status } = payload;

      // 1. File store (instant, always)
      updateOrderStatus(orderId, status);

      // 2. MongoDB — best-effort with timeout
      if (dbConnected && orderId && orderId.length === 24 && !orderId.startsWith("mock_")) {
        await safeDbWrite(() => Order.updateOne({ _id: orderId }, { orderStatus: status }));
      }

      bustStatsCache();
      return NextResponse.json({ success: true, message: `Order status updated to ${status}` });
    }

    if (action === "cancelSubscription") {
      const { subscriptionId } = payload;

      const store = getStore();
      const sub = store.subscriptions.find((s: any) => s._id === subscriptionId);
      if (sub) {
        sub.status = "cancelled";
        addSubscription(sub);
      }

      if (dbConnected && subscriptionId && subscriptionId.length === 24 && !subscriptionId.startsWith("mock_")) {
        await safeDbWrite(() => Subscription.updateOne({ _id: subscriptionId }, { status: "cancelled" }));
      }

      bustStatsCache();
      return NextResponse.json({ success: true, message: "Subscription cancelled successfully" });
    }

    if (action === "reactivateSubscription") {
      const { subscriptionId } = payload;

      const store = getStore();
      const sub = store.subscriptions.find((s: any) => s._id === subscriptionId);
      if (sub) {
        sub.status = "active";
        addSubscription(sub);
      }

      if (dbConnected && subscriptionId && subscriptionId.length === 24 && !subscriptionId.startsWith("mock_")) {
        await safeDbWrite(() => Subscription.updateOne({ _id: subscriptionId }, { status: "active" }));
      }

      bustStatsCache();
      return NextResponse.json({ success: true, message: "Subscription reactivated successfully" });
    }

    if (action === "toggleCustomerStatus") {
      const { customerId, status } = payload;

      const store = getStore();
      const cust = store.customers.find((c: any) => c._id === customerId);
      if (cust) {
        cust.status = status;
        addCustomer(cust);
      }

      if (dbConnected && customerId && customerId.length === 24 && !customerId.startsWith("mock_")) {
        await safeDbWrite(() => User.updateOne({ _id: customerId }, { status }));
      }

      bustStatsCache();
      return NextResponse.json({ success: true, message: `Customer status updated to ${status}` });
    }

    if (action === "updateInventoryStock") {
      const { stock } = payload;

      // File store (instant, always)
      updateInventoryStock(stock);

      // MongoDB — best-effort with timeout
      if (dbConnected) {
        await safeDbWrite(() => Product.updateOne({}, { stock }));
      }

      bustStatsCache();
      return NextResponse.json({ success: true, message: "Stock level updated successfully", stock });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Action handler failed:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
