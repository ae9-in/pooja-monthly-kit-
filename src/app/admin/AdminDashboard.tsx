/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable react/jsx-no-literals */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
  location?: string;
}

interface Stats {
  dailyOrdersCount: number;
  pendingFulfillmentCount: number;
  monthlyRevenue: number;
  previousMonthlyRevenue: number;
  recentActivity: Activity[];
  revenueChart: number[];
  orders?: any[];
  offlineFallback?: boolean;
}

const DEFAULT_STATS: Stats = {
  dailyOrdersCount: 0,
  pendingFulfillmentCount: 0,
  monthlyRevenue: 0,
  previousMonthlyRevenue: 0,
  recentActivity: [],
  revenueChart: [0, 0, 0, 0, 0, 0, 0],
  orders: [],
  offlineFallback: false,
};

const KPI_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props { onLogout: () => void; }

const STATUS_STYLES: Record<string, string> = {
  confirmed:  "bg-blue-500/15 text-blue-600",
  shipped:    "bg-amber-500/15 text-amber-600",
  delivered:  "bg-emerald-500/15 text-emerald-600",
  cancelled:  "bg-red-500/15 text-red-500",
  pending:    "bg-blue-500/15 text-blue-500",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status?.toLowerCase()] ?? "bg-gray-200/30 text-gray-500";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <tr>
      <td colSpan={10} className="py-16 text-center">
        <span className="material-symbols-outlined text-4xl text-outline-variant block mb-3">{icon}</span>
        <p className="text-sm text-on-surface-variant italic">{message}</p>
      </td>
    </tr>
  );
}

export default function AdminDashboard({ onLogout }: Props) {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("Dashboard");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Search & filter state for Orders
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");

  const isPolling = useRef(false);
  const abortRef  = useRef<AbortController | null>(null);

  const fetchStats = useCallback(async () => {
    if (isPolling.current) return;
    isPolling.current = true;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/admin/stats", { signal: controller.signal });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") console.warn("[AdminDashboard] fetchStats failed:", err.message);
    } finally {
      isPolling.current = false;
      setLoading(false);
    }
  }, []);

  // Poll every 3 seconds for real-time updates
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchStats]);

  const handleAction = async (action: string, payload: any, loadingId: string) => {
    setActionLoadingId(loadingId);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      if (res.ok) {
        await fetchStats();
      } else {
        const d = await res.json();
        alert(`Action failed: ${d.message}`);
      }
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const revenueGrowth = stats.monthlyRevenue > 0
    ? (((stats.monthlyRevenue - stats.previousMonthlyRevenue) / (stats.previousMonthlyRevenue || 1)) * 100).toFixed(1)
    : "0";

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case "shipping":     return "local_shipping";
      case "order":        return "shopping_bag";
      default:             return "notifications";
    }
  };

  const filteredOrders = (stats.orders ?? []).filter((o) => {
    const q = orderSearch.toLowerCase();
    const matchSearch = !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.userId?.fullName?.toLowerCase().includes(q) ||
      o.userId?.email?.toLowerCase().includes(q) ||
      o.userId?.mobile?.toLowerCase().includes(q);
    const matchStatus = orderStatus === "all" || o.orderStatus === orderStatus;
    return matchSearch && matchStatus;
  });

  const navLinks = [
    { icon: "dashboard",    label: "Dashboard" },
    { icon: "receipt_long", label: "Orders"    },
  ];

  const counts: Record<string, number> = {
    Orders: stats.orders?.length ?? 0,
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-64
        bg-surface-container-lowest border-r border-outline-variant
        transition-transform duration-300
        md:translate-x-0 md:static
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand */}
        <div className="p-6 flex items-center gap-3 border-b border-outline-variant">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
          </div>
          <div>
            <div className="font-bold text-primary text-sm leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              SacredSamskara
            </div>
            <div className="text-[10px] text-on-surface-variant mt-0.5 font-semibold uppercase tracking-wider">Admin Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-3 py-4 space-y-1">
          {navLinks.map(({ icon, label }) => (
            <button
              key={label}
              onClick={() => { setCurrentTab(label); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                currentTab === label
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface hover:bg-surface-container hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              <span className="flex-1">{label}</span>
              {counts[label] !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  currentTab === label ? "bg-on-primary/20 text-on-primary" : "bg-primary/10 text-primary"
                }`}>
                  {counts[label]}
                </span>
              )}
            </button>
          ))}

          <div className="pt-4 border-t border-outline-variant mt-4">
            <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">home</span>
              View Store
            </Link>
            <Link href="/checkout" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              Checkout
            </Link>
          </div>
        </nav>

        {/* Bottom: Logout */}
        <div className="p-4 border-t border-outline-variant">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-error hover:bg-error/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <div className="flex-grow flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-surface-container-lowest border-b border-outline-variant px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-on-surface" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-on-background text-base leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {currentTab === "Dashboard" ? "Dashboard Overview" : "Orders Management"}
                </h1>
                {stats.offlineFallback && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Offline Fallback
                  </span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                {currentTab === "Dashboard"
                  ? "Real-time updates of your sacred store metrics"
                  : "Manage and fulfill customer orders"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container text-on-surface hover:bg-surface-dim transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[14px] ${loading ? "animate-spin" : ""}`}>refresh</span>
              Refresh
            </button>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        <main className="flex-grow p-4 md:p-8 space-y-6 overflow-y-auto">

          {/* ════════════════════════ DASHBOARD TAB ════════════════════════ */}
          {currentTab === "Dashboard" && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Orders",           value: loading ? "—" : stats.dailyOrdersCount,                     sub: `${stats.pendingFulfillmentCount} pending fulfillment`, icon: "shopping_bag",          color: "text-blue-500",    bg: "bg-blue-500" },
                  { label: "Total Revenue",          value: loading ? "—" : `₹${stats.monthlyRevenue.toLocaleString("en-IN")}`, sub: `+${revenueGrowth}% vs prev period`,   icon: "account_balance_wallet", color: "text-primary",     bg: "bg-primary" },
                  { label: "Pending Fulfillment",    value: loading ? "—" : stats.pendingFulfillmentCount,               sub: "Awaiting packaging/shipping",          icon: "local_shipping",        color: "text-amber-500",   bg: "bg-amber-500" },
                ].map(({ label, value, sub, icon, color, bg }) => (
                  <div key={label} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-3 right-3 opacity-[0.07]">
                      <span className={`material-symbols-outlined ${color}`} style={{ fontSize: "64px" }}>{icon}</span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant uppercase font-semibold tracking-wider block mb-2">{label}</span>
                    <div className={`text-3xl font-bold ${color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{value}</div>
                    <p className="text-xs text-on-surface-variant mt-1.5">{sub}</p>
                    <div className={`absolute bottom-0 left-0 h-1 w-full ${bg} opacity-20 rounded-b-xl`} />
                  </div>
                ))}
              </div>

              {/* Chart + Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/50 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-on-background" style={{ fontFamily: "'Playfair Display', serif" }}>Revenue Trends</h3>
                    <span className="text-[10px] text-on-surface-variant font-semibold">Last 7 periods</span>
                  </div>
                  <div className="h-48 border-b border-l border-outline-variant relative flex items-end justify-between gap-1 px-2 pb-2 pt-8">
                    <div className="absolute left-[-28px] top-0 bottom-2 flex flex-col justify-between text-[9px] text-on-surface-variant font-semibold">
                      <span>High</span><span>Mid</span><span>Low</span>
                    </div>
                    {stats.revenueChart.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div
                          style={{ height: `${h}%` }}
                          className={`w-full rounded-t-md transition-all duration-700 cursor-pointer relative
                            ${i === stats.revenueChart.indexOf(Math.max(...stats.revenueChart))
                              ? "bg-primary hover:bg-primary/90"
                              : "bg-primary-fixed-dim hover:bg-primary-container"}`}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                            {h}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between px-2 mt-2">
                    {KPI_DAYS.map((d) => (
                      <span key={d} className="flex-1 text-center text-[9px] text-on-surface-variant font-semibold">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/50 shadow-sm flex flex-col max-h-[340px]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-on-background" style={{ fontFamily: "'Playfair Display', serif" }}>Recent Activity</h3>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                    {stats.recentActivity.map((a) => (
                      <div key={a.id} className="flex items-start gap-2.5 pb-3 border-b border-outline-variant/40 last:border-0">
                        <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[13px] text-on-secondary-fixed">{getActivityIcon(a.type)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-on-surface leading-snug line-clamp-2">{a.description}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{a.time}{a.location ? ` • ${a.location}` : ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════ ORDERS TAB ════════════════════════ */}
          {currentTab === "Orders" && (
            <div className="space-y-4">
              {/* Search + Filter Bar */}
              <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/50 shadow-sm flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">search</span>
                  <input
                    type="text"
                    placeholder="Search by order #, name, email, mobile…"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-container rounded-lg text-sm border border-outline-variant focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="px-3 py-2 bg-surface-container rounded-lg text-sm border border-outline-variant focus:border-primary focus:outline-none transition-colors font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span className="text-xs text-on-surface-variant font-semibold ml-auto">
                  {filteredOrders.length} of {stats.orders?.length ?? 0} orders
                </span>
              </div>

              {/* Orders Table */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container/50 text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">Order # / Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Product / Type</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-sm">
                      {filteredOrders.length === 0 ? (
                        <EmptyState icon="receipt_long" message="No orders found. Place orders on the checkout page to see them here." />
                      ) : filteredOrders.map((ord: any) => {
                        const isLoading = actionLoadingId === `order-${ord._id}`;
                        return (
                          <tr key={ord._id} className="hover:bg-surface-container-low transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-bold text-xs text-primary">{ord.orderNumber}</div>
                              <div className="text-[11px] text-on-surface-variant mt-0.5">
                                {new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                              <div className="text-[10px] text-on-surface-variant">
                                {new Date(ord.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-on-surface">{ord.userId?.fullName || "Guest"}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-xs text-on-surface-variant">{ord.userId?.email || "—"}</div>
                              <div className="text-xs text-on-surface-variant font-medium mt-0.5">📱 {ord.userId?.mobile || "—"}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-on-surface text-xs">{ord.productId?.productName || "Monthly Pooja Kit"}</div>
                              <span className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${ord.orderType === "subscription" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                                {ord.orderType}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-primary">₹{ord.finalAmount}</td>
                            <td className="py-3.5 px-4"><StatusBadge status={ord.orderStatus} /></td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex justify-end gap-1.5 flex-wrap">
                                {ord.orderStatus === "confirmed" && (
                                  <button disabled={isLoading} onClick={() => handleAction("updateOrderStatus", { orderId: ord._id, status: "shipped" }, `order-${ord._id}`)} className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-xs font-bold transition-colors disabled:opacity-50">
                                    Ship
                                  </button>
                                )}
                                {ord.orderStatus === "shipped" && (
                                  <button disabled={isLoading} onClick={() => handleAction("updateOrderStatus", { orderId: ord._id, status: "delivered" }, `order-${ord._id}`)} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold transition-colors disabled:opacity-50">
                                    Deliver
                                  </button>
                                )}
                                {!["cancelled", "delivered"].includes(ord.orderStatus) && (
                                  <button disabled={isLoading} onClick={() => handleAction("updateOrderStatus", { orderId: ord._id, status: "cancelled" }, `order-${ord._id}`)} className="px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-colors disabled:opacity-50">
                                    Cancel
                                  </button>
                                )}
                                {isLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Orders Summary Footer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Confirmed",  count: (stats.orders ?? []).filter(o => o.orderStatus === "confirmed").length,  color: "text-blue-600"    },
                  { label: "Shipped",    count: (stats.orders ?? []).filter(o => o.orderStatus === "shipped").length,    color: "text-amber-600"   },
                  { label: "Delivered",  count: (stats.orders ?? []).filter(o => o.orderStatus === "delivered").length,  color: "text-emerald-600" },
                  { label: "Cancelled",  count: (stats.orders ?? []).filter(o => o.orderStatus === "cancelled").length,  color: "text-red-500"     },
                ].map(({ label, count, color }) => (
                  <div key={label} className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/50 text-center shadow-sm">
                    <div className={`text-2xl font-bold ${color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{count}</div>
                    <div className="text-xs text-on-surface-variant font-semibold mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
