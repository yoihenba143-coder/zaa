"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import GoogleAuthButton from "@/components/GoogleAuthButton";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  const [mode, setMode] = useState<"customer" | "admin">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFillAdminDemo() {
    setEmail("admin@zaa.com");
    setPassword("admin123");
    setError("");
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          isAdminLogin: mode === "admin",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      const userRole = data.user?.role || (mode === "admin" ? "admin" : "user");

      // Save user details with role
      localStorage.setItem(
        "zaa_user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: userRole,
        })
      );

      window.dispatchEvent(new Event("zaa-user-updated"));

      if (userRole === "admin" || mode === "admin") {
        router.push("/admin");
      } else if (redirectTarget && redirectTarget.startsWith("/")) {
        router.push(redirectTarget);
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-24">
      {/* Background glow effects */}
      <div className={`absolute left-10 top-20 h-72 w-72 rounded-full blur-3xl transition-all duration-700 ${mode === "admin" ? "bg-amber-600/20" : "bg-red-600/10"}`} />
      <div className={`absolute bottom-10 right-10 h-72 w-72 rounded-full blur-3xl transition-all duration-700 ${mode === "admin" ? "bg-red-600/20" : "bg-red-600/10"}`} />

      <div className="relative w-full max-w-md">
        {/* Mode Switcher Tabs */}
        <div className="mb-4 flex rounded-2xl border border-zinc-800 bg-zinc-900/90 p-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setMode("customer");
              setError("");
            }}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${mode === "customer"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
              : "text-zinc-400 hover:text-white"
              }`}
          >
            👤 Customer Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError("");
            }}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${mode === "admin"
              ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/30"
              : "text-zinc-400 hover:text-white"
              }`}
          >
            🛡️ Admin Portal
          </button>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/95 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo & Title */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center gap-2">
              <h1 className="text-4xl font-black tracking-tight">
                <span className="text-red-600">Z</span>
                <span className="text-white">AA</span>
              </h1>
              {mode === "admin" && (
                <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Admin
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-zinc-400">
              {mode === "admin"
                ? "Administrator Console & Store Management"
                : "Welcome back to ZAA"}
            </p>

            {mode === "admin" && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1 text-[11px] text-zinc-300">
                  🔒 Restricted Management Access
                </span>
              </div>
            )}
          </div>

          {/* Redirect Notice Banner */}
          {redirectTarget && mode === "customer" && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs text-red-200">
              <span className="text-base">🔒</span>
              <span>Please log in to order products and access your shopping cart.</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Customer Mode: Google Sign-in */}
          {mode === "customer" && (
            <div className="mb-6">
              <GoogleAuthButton mode="login" onError={(err) => setError(err)} />

              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full border-t border-zinc-800" />
                <span className="absolute bg-zinc-900 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Or continue with email
                </span>
              </div>
            </div>
          )}

          {/* Admin Mode: Demo helper banner */}
          {mode === "admin" && (
            <div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3.5 text-center">
              <p className="text-xs text-amber-200/90">
                Default Admin: <span className="font-mono font-bold text-white">admin@zaa.com</span>
              </p>
              <button
                type="button"
                onClick={handleFillAdminDemo}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 hover:text-white"
              >
                <span>⚡ Autofill Admin Credentials</span>
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-300"
              >
                {mode === "admin" ? "Admin Email" : "Email Address"}
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "admin" ? "admin@zaa.com" : "Enter your email"}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-300"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
              />
            </div>

            {mode === "customer" && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-red-500 transition hover:text-red-400"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-4 py-3.5 font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg ${mode === "admin"
                ? "bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-red-600/30"
                : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                }`}
            >
              {loading
                ? "AUTHENTICATING..."
                : mode === "admin"
                  ? "ACCESS ADMIN DASHBOARD →"
                  : "LOGIN"}
            </button>
          </form>

          {mode === "customer" ? (
            <div className="mt-6 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href={redirectTarget ? `/register?redirect=${encodeURIComponent(redirectTarget)}` : "/register"}
                className="font-semibold text-red-500 hover:text-red-400"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMode("customer")}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ← Return to Customer Login
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          © 2026 ZAA. All rights reserved.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
