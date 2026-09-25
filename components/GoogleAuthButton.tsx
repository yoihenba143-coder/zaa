"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GoogleAuthButtonProps {
  mode: "login" | "register";
  onError?: (error: string) => void;
}

export default function GoogleAuthButton({
  mode: initialMode,
  onError,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "info" | "success";
    text: string;
    canSwitchMode?: "login" | "register";
  } | null>(null);

  const buttonLabel =
    initialMode === "login" ? "Continue with Google" : "Join with Google";

  const validateEmail = (email: string) => {
    const trimmed = email.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(trimmed);
  };

  const handleGoogleAuth = async (
    rawEmail: string,
    rawName: string,
    modeToUse: "login" | "register"
  ) => {
    let emailToUse = rawEmail.trim().toLowerCase();
    
    
    if (emailToUse && !emailToUse.includes("@")) {
      emailToUse += "@gmail.com";
      setGoogleEmail(emailToUse);
    }

    if (!validateEmail(emailToUse)) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid Gmail address (e.g. yourname@gmail.com)",
      });
      return;
    }

    if (modeToUse === "register" && !rawName.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter your full name to create a new account.",
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
          name: rawName.trim() || emailToUse.split("@")[0],
          mode: modeToUse,
          googleId: "g_" + Math.random().toString(36).slice(2, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && data.notFound) {
         
          setStatusMessage({
            type: "error",
            text: "No account found with this Google email. Would you like to create a new one?",
            canSwitchMode: "register",
          });
          return;
        }

        if (response.status === 409 && data.alreadyExists) {
          
          setStatusMessage({
            type: "info",
            text: "An account with this Google email already exists! You can log in directly.",
            canSwitchMode: "login",
          });
          return;
        }

        throw new Error(data.message || "Failed to process Google authentication");
      }

    
      localStorage.setItem(
        "zaa_user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
        })
      );

      window.dispatchEvent(new Event("zaa-user-updated"));
      setShowModal(false);
      let redirectTarget = "/";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const redir = params.get("redirect");
        if (redir && redir.startsWith("/")) {
          redirectTarget = redir;
        }
      }
      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: err.message || "Google authentication failed. Please try again.",
      });
      onError?.(err.message || "Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setCurrentMode(initialMode);
    setStatusMessage(null);
    setShowModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        disabled={loading}
        className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3.5 text-sm font-bold text-white transition duration-200 hover:border-zinc-500 hover:bg-zinc-800/80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-black/40"
      >
      
        <svg
          className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
        >
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.44 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.56 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>

        <span>{loading ? "Connecting..." : buttonLabel}</span>
      </button>

    
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
          
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              aria-label="Close"
            >
              ✕
            </button>

          
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.44 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.56 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-black text-white">
                {currentMode === "login"
                  ? "Sign In with Google"
                  : "Create Account with Google"}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                {currentMode === "login"
                  ? "Sign in using your registered Google email"
                  : "Register a brand new ZAA account with Google"}
              </p>
            </div>

          
            {statusMessage && (
              <div
                className={`mt-4 rounded-xl border p-3 text-xs ${
                  statusMessage.type === "error"
                    ? "border-red-900 bg-red-950/50 text-red-300"
                    : "border-emerald-900 bg-emerald-950/50 text-emerald-300"
                }`}
              >
                <p className="font-semibold">{statusMessage.text}</p>
                {statusMessage.canSwitchMode && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = statusMessage.canSwitchMode!;
                      setCurrentMode(nextMode);
                      setStatusMessage(null);
                      if (googleEmail.trim()) {
                        handleGoogleAuth(googleEmail, googleName, nextMode);
                      }
                    }}
                    className="mt-2.5 block w-full rounded-lg bg-red-600 py-2 text-center text-xs font-bold text-white transition hover:bg-red-500 shadow-md"
                  >
                    {statusMessage.canSwitchMode === "register"
                      ? "Create New Account with This Email →"
                      : "Log In to This Existing Account →"}
                  </button>
                )}
              </div>
            )}

          
            <div className="mt-5 space-y-4 text-left">
              {currentMode === "register" && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Gmail / Google Address *
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && googleEmail.trim()) {
                      e.preventDefault();
                      handleGoogleAuth(googleEmail, googleName, currentMode);
                    }
                  }}
                  placeholder="yourname@gmail.com"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  Must be a valid Gmail or Google Workspace address
                </p>
              </div>

            
              <button
                type="button"
                disabled={loading || !googleEmail.trim()}
                onClick={() => {
                  handleGoogleAuth(googleEmail, googleName, currentMode);
                }}
                className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-95 shadow-lg shadow-red-950/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>{currentMode === "login" ? "⚡" : "✨"}</span>
                <span>
                  {loading
                    ? "Authenticating..."
                    : currentMode === "login"
                    ? "Sign In with Google Account →"
                    : "Create ZAA Account with Google →"}
                </span>
              </button>

            
              <div className="pt-2 text-center text-xs text-zinc-500">
                {currentMode === "login" ? (
                  <p>
                    Don&apos;t have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentMode("register");
                        setStatusMessage(null);
                      }}
                      className="font-bold text-red-500 hover:text-red-400 transition underline underline-offset-2"
                    >
                      Create account with Google
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentMode("login");
                        setStatusMessage(null);
                      }}
                      className="font-bold text-red-500 hover:text-red-400 transition underline underline-offset-2"
                    >
                      Log in with Google
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
