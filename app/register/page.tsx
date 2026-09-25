"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import GoogleAuthButton from "@/components/GoogleAuthButton";

 async function handleRegister(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  if (password.length < 8) {
    throw new Error("Password must contain at least 8 characters");
  }


  const response = await fetch("/api/auth/register", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const text = await response.text();

  let data: {
    message?: string;
    error?: string;
  } = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned an invalid response");
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Registration failed"
    );
  }

  return true;
}

function RegisterContent() {
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  async function onSubmit(formData: FormData) {
    try {
      setError("");

      await handleRegister(formData);

      router.push(
        redirectTarget
          ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
          : "/login"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred"
      );
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-20">

      
      <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />

      <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />

      <div className="relative w-full max-w-md">

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">

          <div className="mb-8 text-center">

            <h1 className="text-5xl font-black tracking-tight">
              <span className="text-red-600">Z</span>
              <span className="text-white">AA</span>
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Create your ZAA account
            </p>

          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Google Sign-up */}
          <div className="mb-6">
            <GoogleAuthButton mode="register" onError={(err) => setError(err)} />

            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-zinc-800" />
              <span className="absolute bg-zinc-900 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Or register with email
              </span>
            </div>
          </div>

          <form
            action={onSubmit}
            className="space-y-5"
          >
            <div>

              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-zinc-200"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
              />

            </div>


            <div>

              <label
                htmlFor="mobile-number"
                className="mb-2 block text-sm font-semibold text-zinc-200"
              >
                Mobile Number
              </label>

              <input
                id="mobile-number"
                name="mobile-number"
                type="text"
                placeholder="Enter your mobile number"
                autoComplete="tel"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
              />

            </div>



            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-zinc-200"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
              />

            </div>


            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-zinc-200"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Password must contain at least 8 characters.
              </p>

            </div>


            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-4 py-3.5 font-bold text-white transition hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 active:scale-[0.98]"
            >
              CREATE ACCOUNT
            </button>

          </form>


          <div className="mt-7 text-center text-sm text-zinc-500">

            Already have an account?{" "}

            <Link
              href={
                redirectTarget
                  ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
                  : "/login"
              }
              className="font-semibold text-red-500 transition hover:text-red-400"
            >
              Login
            </Link>

          </div>

        </div>


        <p className="mt-6 text-center text-xs text-zinc-600">
          © 2026 ZAA. All rights reserved.
        </p>

      </div>

    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </main>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

