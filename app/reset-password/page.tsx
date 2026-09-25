"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Invalid or missing reset token. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to reset password.");
        return;
      }

      setIsSuccess(true);
      setMessage(data.message || "Your password has been reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      console.error(err);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-black tracking-tight mb-2">
            <span className="text-red-600">Z</span>AA
          </Link>
          <h1 className="text-2xl font-bold text-white">Create New Password</h1>
          <p className="text-sm text-zinc-400 mt-1">Enter your new password below</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
              isSuccess
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                : "bg-red-950/40 border-red-800 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {!isSuccess ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Updating Password..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-block w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Go to Login →
            </Link>
          </div>
        )}

        <div className="mt-8 text-center border-t border-zinc-800 pt-6">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-zinc-500 text-sm">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
