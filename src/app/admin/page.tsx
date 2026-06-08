"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy-load the heavy dashboard — keeps initial login page ultra-fast
const AdminDashboard = dynamic(() => import("./AdminDashboard"), {
  loading: () => (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#d4a017]/5 blur-[80px] pointer-events-none animate-pulse" />
      <div className="text-center space-y-6 relative z-10 flex flex-col items-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#795900]/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#795900] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-[#8f4e00]/20 animate-ping [animation-duration:2s]" />
          <div className="absolute inset-3 rounded-full border border-[#795900]/20 animate-pulse" />
          <span className="material-symbols-outlined text-[#795900] text-4xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#795900] tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
            SacredSamskara
          </h2>
          <p className="text-xs text-[#4f4634] uppercase tracking-widest font-semibold animate-pulse">
            Loading Dashboard…
          </p>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

const SESSION_KEY = "ss_admin_auth";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check session on mount
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    setIsAuthenticated(session === "true");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Credentials are verified server-side — they never appear in the browser bundle
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem(SESSION_KEY, "true");
        setIsAuthenticated(true);
      } else {
        setError(data.message || "Invalid credentials. Please check your username and password.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
  };

  // Still checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show dashboard if authenticated
  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // ── Login Page ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center px-4 relative overflow-hidden">
      {/* Lotus pattern top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4 divine-glow">
            <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
          </div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
            SacredSamskara
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 luxury-shadow border border-outline-variant/40">
          <h2 className="text-xl font-bold text-on-background mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Welcome back
          </h2>
          <p className="text-on-surface-variant text-sm mb-6">Sign in to manage your sacred store</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-on-surface text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-on-surface text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-error-container/20 border border-error/20 rounded-lg">
                <span className="material-symbols-outlined text-error text-[16px] mt-0.5 shrink-0">error</span>
                <p className="text-error text-xs leading-snug">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-on-primary font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md divine-glow"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Sign In to Admin
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-on-surface-variant mt-6">
          © 2025 SacredSamskara · Admin Portal v2.0
        </p>
      </div>
    </div>
  );
}
