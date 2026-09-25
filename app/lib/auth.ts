export type AuthUser = {
  name: string;
  email: string;
  role?: string;
  phone?: string;
};

export function getLoggedInUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("zaa_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && (parsed.email || parsed.name)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getLoggedInUser();
}
