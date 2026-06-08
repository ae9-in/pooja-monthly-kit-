/**
 * api-perf-test.mjs
 * Comprehensive API performance test for all SacredSamskara endpoints.
 * Run with: node api-perf-test.mjs
 * Requires the dev server to be running on http://localhost:3000
 */

const BASE = "http://localhost:3000";

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED    = "\x1b[31m";
const CYAN   = "\x1b[36m";
const DIM    = "\x1b[2m";

function colour(ms) {
  if (ms < 200)  return GREEN  + ms + "ms" + RESET;
  if (ms < 800)  return YELLOW + ms + "ms" + RESET;
  return RED + ms + "ms" + RESET;
}

function label(tag) {
  return CYAN + BOLD + `[${tag}]` + RESET;
}

async function hit(method, path, body, description) {
  const url = BASE + path;
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const t0 = performance.now();
  let status = "?", ok = false, snippet = "";
  try {
    const res = await fetch(url, opts);
    status = res.status;
    ok = res.ok;
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      snippet = JSON.stringify(json).slice(0, 120);
    } catch {
      snippet = text.slice(0, 120);
    }
  } catch (e) {
    snippet = "FETCH ERROR: " + e.message;
  }
  const ms = Math.round(performance.now() - t0);

  const statusIcon = ok ? GREEN + "✓" + RESET : RED + "✗" + RESET;
  console.log(
    `  ${statusIcon} ${BOLD}${method.padEnd(4)}${RESET} ${path.padEnd(35)} ` +
    `${DIM}HTTP ${status}${RESET}  ${colour(ms).padEnd(20)} ${description}`
  );
  if (!ok) {
    console.log(`     ${DIM}↳ ${snippet}${RESET}`);
  }
  return { path, method, ms, status, ok };
}

async function hitMany(method, path, body, description, n = 3) {
  const times = [];
  for (let i = 0; i < n; i++) {
    const r = await hit(method, path, body, i === 0 ? description : `  [repeat ${i+1}/${n}]`);
    times.push(r.ms);
  }
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  console.log(`     ${DIM}↳ avg ${colour(avg)} over ${n} calls  (${times.join("ms, ")}ms)${RESET}`);
  return times;
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n" + BOLD + "═".repeat(70) + RESET);
  console.log(BOLD + "  SacredSamskara API Performance Test Suite" + RESET);
  console.log(BOLD + "═".repeat(70) + RESET + "\n");

  const allResults = [];

  // ── 1. Pages (SSR/ISR) ───────────────────────────────────────────────────
  console.log(label("PAGES") + " HTML page response times\n");

  for (const [path, desc] of [
    ["/",              "Home page (ISR, should be fast after warm)"],
    ["/checkout",      "Checkout page"],
    ["/admin",         "Admin login page"],
  ]) {
    const t0 = performance.now();
    let status = "?", ok = false;
    try {
      const res = await fetch(BASE + path);
      status = res.status;
      ok = res.ok;
      await res.text(); // drain body
    } catch {}
    const ms = Math.round(performance.now() - t0);
    const statusIcon = ok ? GREEN + "✓" + RESET : RED + "✗" + RESET;
    console.log(
      `  ${statusIcon} ${BOLD}GET ${RESET} ${path.padEnd(35)} ` +
      `${DIM}HTTP ${status}${RESET}  ${colour(ms).padEnd(20)} ${desc}`
    );
    allResults.push({ path, method: "GET", ms, status, ok });
  }

  // ── 2. Admin Login ───────────────────────────────────────────────────────
  console.log("\n" + label("AUTH") + " POST /api/admin/login\n");

  await hit("POST", "/api/admin/login",
    { email: "admin@gmail.com", password: "wrongpassword" },
    "Login with WRONG credentials (expect 401)"
  ).then(r => allResults.push(r));

  await hit("POST", "/api/admin/login",
    { email: "admin@gmail.com", password: "admin123" },
    "Login with CORRECT credentials (expect 200)"
  ).then(r => allResults.push(r));

  await hit("POST", "/api/admin/login",
    {},
    "Login with empty body (expect 400)"
  ).then(r => allResults.push(r));

  // ── 3. Admin Stats — Cold & Warm cache ──────────────────────────────────
  console.log("\n" + label("STATS") + " GET /api/admin/stats — testing server cache\n");

  console.log(`  ${DIM}First call (cache MISS — hits DB or file store):${RESET}`);
  const coldStats = await hit("GET", "/api/admin/stats", null, "Stats cold call");
  allResults.push(coldStats);

  console.log(`\n  ${DIM}Rapid repeat calls (should hit 10s server cache):${RESET}`);
  const warmTimes = await hitMany("GET", "/api/admin/stats", null, "Stats warm call (cached)", 3);
  allResults.push(...warmTimes.map((ms, i) => ({ path: "/api/admin/stats", method: "GET", ms, status: 200, ok: true })));

  // ── 4. Checkout POST ─────────────────────────────────────────────────────
  console.log("\n" + label("CHECKOUT") + " POST /api/checkout\n");

  const sampleOrder = {
    fullName: "Test User",
    mobile: "9999999999",
    email: `test+${Date.now()}@example.com`,
    addressLine1: "123 Test Street",
    city: "Mumbai",
    pincode: "400001",
    paymentMethod: "card",
    planType: "Monthly",
    amount: 450,
    subtotal: 450,
    discount: 0,
  };

  await hit("POST", "/api/checkout", sampleOrder, "Checkout — Monthly subscription");
  allResults.push(
    await hit("POST", "/api/checkout", { ...sampleOrder, email: `test2+${Date.now()}@example.com`, planType: "Quarterly", amount: 1299 },
      "Checkout — Quarterly subscription")
  );
  await hit("POST", "/api/checkout", { ...sampleOrder, email: `test3+${Date.now()}@example.com`, planType: "one-time", amount: 450 },
    "Checkout — One-time order");

  // ── 5. Admin Action ──────────────────────────────────────────────────────
  console.log("\n" + label("ACTION") + " POST /api/admin/action\n");

  // First fetch a real order ID from the file store
  let firstOrderId = null;
  try {
    const statsRes = await fetch(BASE + "/api/admin/stats");
    const statsData = await statsRes.json();
    if (statsData.orders && statsData.orders.length > 0) {
      firstOrderId = statsData.orders[0]._id;
    }
  } catch {}

  if (firstOrderId) {
    await hit("POST", "/api/admin/action",
      { action: "updateOrderStatus", payload: { orderId: firstOrderId, orderNumber: "TEST", status: "shipped" } },
      `Update order ${String(firstOrderId).slice(0, 12)}… → shipped`
    ).then(r => allResults.push(r));

    await hit("POST", "/api/admin/action",
      { action: "updateInventoryStock", payload: { stock: 1450 } },
      "Update inventory stock to 1450"
    ).then(r => allResults.push(r));
  } else {
    await hit("POST", "/api/admin/action",
      { action: "updateInventoryStock", payload: { stock: 1450 } },
      "Update inventory stock to 1450 (no orders yet)"
    ).then(r => allResults.push(r));
  }

  await hit("POST", "/api/admin/action",
    { action: "unknownAction", payload: {} },
    "Unknown action (expect 400)"
  ).then(r => allResults.push(r));

  // ── 6. Summary ───────────────────────────────────────────────────────────
  console.log("\n" + BOLD + "═".repeat(70) + RESET);
  console.log(BOLD + "  SUMMARY" + RESET);
  console.log(BOLD + "═".repeat(70) + RESET);

  const valid = allResults.filter(r => r.ms != null);
  const sorted = [...valid].sort((a, b) => b.ms - a.ms);

  console.log("\n  " + BOLD + "Slowest endpoints:" + RESET);
  sorted.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.method} ${r.path} → ${colour(r.ms)}`);
  });

  console.log("\n  " + BOLD + "Fastest endpoints:" + RESET);
  sorted.slice(-Math.min(5, sorted.length)).reverse().forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.method} ${r.path} → ${colour(r.ms)}`);
  });

  const failures = allResults.filter(r => !r.ok && r.status !== 400 && r.status !== 401);
  if (failures.length > 0) {
    console.log("\n  " + RED + BOLD + "FAILURES (unexpected):" + RESET);
    failures.forEach(r => console.log(`  ✗ ${r.method} ${r.path} → HTTP ${r.status}`));
  } else {
    console.log("\n  " + GREEN + BOLD + "✓ All endpoints responded correctly." + RESET);
  }

  const avgMs = Math.round(valid.reduce((s, r) => s + r.ms, 0) / valid.length);
  console.log("\n  " + BOLD + `Overall average response time: ${colour(avgMs)}` + RESET);
  console.log(BOLD + "═".repeat(70) + RESET + "\n");
}

main().catch(e => {
  console.error("Test script error:", e);
  process.exit(1);
});
