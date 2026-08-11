"use client";

export function useSignOut(): () => Promise<void> {
  return async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };
}
