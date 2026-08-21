// Whether this browser has already reached the onboarding/marketing page
// once before — lets the splash redirect skip straight to sign-in for a
// returning visitor whose session has simply expired, instead of showing
// the first-time intro again. Local to the browser, not tied to any
// account, so it survives logging out (a returning-but-signed-out user
// still doesn't need the marketing copy again).
const STORAGE_KEY = "opemfo_has_onboarded";

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private browsing / storage disabled — treat as not seen, which just
    // means onboarding shows again; never block the redirect over this.
    return false;
  }
}

export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Ignore — see hasSeenOnboarding.
  }
}
