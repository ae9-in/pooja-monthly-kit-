export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Product from "@/models/Product";
import { getStore } from "@/lib/persistentDb";

// ── Server-side in-process cache ─────────────────────────────────────────────
// Stored on globalThis so it survives Next.js hot-module reloads in dev mode.
// The action route busts it by zeroing __statsCacheTs.
const CACHE_TTL_MS = 10_000; // 10 seconds

function isCacheValid(): boolean {
  const cache = (globalThis as any).__statsCache;
  if (!cache) return false;
  if ((globalThis as any).__statsCacheTs === 0) return false;
  return Date.now() - cache.ts < CACHE_TTL_MS;
}

function getCached(): any {
  return (globalThis as any).__statsCache?.data;
}

function stampCache(data: any) {
  const ts = Date.now();
  (globalThis as any).__statsCache = { data, ts };
  (globalThis as any).__statsCacheTs = ts;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildRecentActivity(orders: any[]): Array<{ id: string; type: string; description: string; time: string; location: string | undefined }> {
  const activity: Array<{ id: string; type: string; description: string; time: string; location: string | undefined }> = orders.slice(0, 5).map((ord: any) => {
    const name = ord.userId?.fullName || "Guest Customer";
    const isSub = ord.orderType === "subscription";

    let type = "order";
    let description = `Order #${ord.orderNumber} containing Monthly Pooja Kit was placed by ${name}.`;

    if (isSub) {
      type = "subscription";
      description = `${name} started a new Monthly Puja subscription (${ord.orderNumber}).`;
    } else if (ord.orderStatus === "delivered") {
      type = "shipping";
      description = `Order #${ord.orderNumber} delivered successfully to ${name}.`;
    }

    const diffMs = Date.now() - new Date(ord.createdAt).getTime();
    const diffMins = Math.max(1, Math.round(diffMs / (1000 * 60)));
    let timeStr = `${diffMins} mins ago`;
    if (diffMins > 60) {
      const diffHours = Math.round(diffMins / 60);
      timeStr = `${diffHours} hours ago`;
      if (diffHours > 24) timeStr = `${Math.round(diffHours / 24)} days ago`;
    }

    return {
      id: ord._id?.toString() ?? ord.orderNumber,
      type,
      description,
      time: timeStr,
      location: isSub ? "Delhi" : "Mumbai",
    };
  });

  if (activity.length === 0) {
    activity.push({ id: "default", type: "inventory", description: "System initialized. No orders placed yet.", time: "Just now", location: undefined });
  }
  return activity;
}

function buildRevenueChart(monthlyRevenue: number): number[] {
  const chartBase = [30, 45, 60, 50, 75, 65, 90];
  return chartBase.map((baseVal, i) =>
    Math.min(100, Math.max(15, Math.round(baseVal + (monthlyRevenue % (i + 3)) * 1.5)))
  );
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET() {
  // ── Serve from cache if fresh ─────────────────────────────────────────────
  if (isCacheValid()) {
    return NextResponse.json(getCached(), {
      headers: { "Cache-Control": "no-store", "X-Stats-Cache": "hit" },
    });
  }

  // ── Try DB connection (1.5s timeout) ──────────────────────────────────────
  let dbConnected = false;
  try {
    await Promise.race([
      connectToDatabase(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB connection timed out (1.5s)")), 1500)
      ),
    ]);
    dbConnected = true;
  } catch (error: any) {
    console.warn("[stats] DB connection failed, using file store:", error.message);
  }

  // ── Build response ────────────────────────────────────────────────────────
  try {
    let responseData: any;

    if (dbConnected) {
      // Wrap ALL Mongoose queries in a 3s hard timeout — if Atlas is connected
      // but slow, we cleanly fall back to the file store instead of hanging 10s+.
      try {
        const results = await Promise.race([
          Promise.all([
            Order.countDocuments({}).maxTimeMS(2500),
            Order.countDocuments({ orderStatus: { $in: ["pending", "confirmed", "packed", "shipped"] } }).maxTimeMS(2500),
            Order.find({ orderStatus: { $ne: "cancelled" } }).select("finalAmount").lean().maxTimeMS(2500),
            Subscription.countDocuments({ status: "active" }).maxTimeMS(2500),
            Subscription.countDocuments({ status: { $ne: "active" } }).maxTimeMS(2500),
            Order.find({}).select("orderNumber orderType orderStatus userId createdAt").populate("userId", "fullName").sort({ createdAt: -1 }).limit(5).lean().maxTimeMS(2500),
            Order.find({}).select("orderNumber orderType orderStatus userId productId subtotal discount finalAmount createdAt").populate("userId", "fullName email mobile").populate("productId", "productName").sort({ createdAt: -1 }).limit(200).lean().maxTimeMS(2500),
            Subscription.find({}).select("userId productId planType amount status createdAt nextRenewalDate").populate("userId", "fullName email mobile").populate("productId", "productName").sort({ createdAt: -1 }).limit(200).lean().maxTimeMS(2500),
            User.find({ role: "customer" }).select("fullName email mobile createdAt totalOrders totalSpent").sort({ createdAt: -1 }).limit(200).lean().maxTimeMS(2500),
            Product.findOne({}).select("stock").lean().maxTimeMS(2500),
          ]),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Query batch timed out (3s)")), 3000)
          ),
        ]);

        const [
          dailyOrdersCount, pendingFulfillmentCount, revenueOrders,
          activeSubscriptionsCount, cancelledSubscriptionsCount,
          recentOrders, allOrders, allSubscriptions, allCustomers, liveProduct,
        ] = results;

        const monthlyRevenue = (revenueOrders as any[]).reduce((sum, o) => sum + (o.finalAmount || 0), 0);

        responseData = {
          dailyOrdersCount,
          pendingFulfillmentCount,
          monthlyRevenue,
          previousMonthlyRevenue: Math.round(monthlyRevenue * 0.85),
          activeSubscriptionsCount,
          cancelledSubscriptionsCount,
          recentActivity: buildRecentActivity(recentOrders as any[]),
          revenueChart: buildRevenueChart(monthlyRevenue),
          orders: allOrders,
          subscriptions: allSubscriptions,
          customers: allCustomers,
          offlineFallback: false,
          inventoryStock: (liveProduct as any)?.stock ?? 1500,
        };
      } catch (queryErr: any) {
        // Queries failed — fall through to file store
        console.warn("[stats] Mongoose queries failed, using file store:", queryErr.message);
        dbConnected = false;
      }
    }

    if (!dbConnected || !responseData) {
      // ── File-based fallback ─────────────────────────────────────────────
      const store = getStore();

      const monthlyRevenue = store.orders
        .filter((o) => o.orderStatus !== "cancelled")
        .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

      responseData = {
        dailyOrdersCount: store.orders.length,
        pendingFulfillmentCount: store.orders.filter((o) =>
          ["pending", "confirmed", "packed", "shipped"].includes(o.orderStatus)
        ).length,
        monthlyRevenue,
        previousMonthlyRevenue: Math.round(monthlyRevenue * 0.85),
        activeSubscriptionsCount: store.subscriptions.filter((s) => s.status === "active").length,
        cancelledSubscriptionsCount: store.subscriptions.filter((s) => s.status !== "active").length,
        recentActivity: buildRecentActivity(store.orders),
        revenueChart: buildRevenueChart(monthlyRevenue),
        orders: store.orders,
        subscriptions: store.subscriptions,
        customers: store.customers,
        offlineFallback: true,
        inventoryStock: store.inventoryStock,
      };
    }

    stampCache(responseData);

    return NextResponse.json(responseData, {
      headers: { "Cache-Control": "no-store", "X-Stats-Cache": "miss" },
    });
  } catch (error: any) {
    console.error("[stats] Failed to gather admin stats:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
