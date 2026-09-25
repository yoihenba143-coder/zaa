
"use client";

import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleForgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setResetUrl("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      setMessage(data.message || "Reset link generated.");

      
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              <span className="text-red-500">Z</span>
              <span className="text-white">AA</span>
            </h1>

            <h2 className="text-2xl font-semibold mt-4">
              Forgot Password?
            </h2>

            <p className="text-zinc-400 mt-2 text-sm">
              Enter your registered email address and we'll help you
              reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-red-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed py-3 font-semibold transition"
            >
              {loading ? "Generating Reset Link..." : "Reset Password"}
            </button>

          </form>

          {message && (
            <div className="mt-6 rounded-xl bg-zinc-800 border border-zinc-700 p-4 text-sm text-zinc-200">
              {message}
            </div>
          )}

          {resetUrl && (
            <div className="mt-4 rounded-xl bg-green-950 border border-green-800 p-4">

              <p className="text-green-400 text-sm font-semibold mb-2">
                Password Reset Link
              </p>

              <a
                href={resetUrl}
                className="text-green-300 text-sm break-all underline hover:text-green-200"
              >
                {resetUrl}
              </a>

            </div>
          )}

          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              ← Back to Login
            </a>
          </div>

        </div>

      </div>
    </main>
  );
}

