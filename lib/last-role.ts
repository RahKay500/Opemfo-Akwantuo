// Purely a client-side UI personalization hint (which role last signed in on
// this browser, so the login screen can greet a returning user by role) —
// never sent to the server, unrelated to the actual session/auth cookies.
const KEY = "opemfo_last_role";

export type LastRole = "MOTHER" | "MIDWIFE" | "DOCTOR";

export function setLastRole(role: string): void {
  if (role !== "MOTHER" && role !== "MIDWIFE" && role !== "DOCTOR") return;
  try {
    localStorage.setItem(KEY, role);
  } catch {
    // Storage unavailable (private browsing, etc.) — greeting just stays generic.
  }
}

export function getLastRole(): LastRole | null {
  try {
    const value = localStorage.getItem(KEY);
    if (value === "MOTHER" || value === "MIDWIFE" || value === "DOCTOR") return value;
    return null;
  } catch {
    return null;
  }
}
