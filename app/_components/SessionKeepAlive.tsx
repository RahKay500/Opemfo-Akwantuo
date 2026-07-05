"use client";

import { useEffect } from "react";

// Silently rotates the access/refresh token pair every 10 minutes so a session
// stays alive past the 15-minute access token expiry while the tab is open.
// No UI — this is what makes "refresh" visibly work (you just don't get logged
// out), rather than something with its own button to click.
export default function SessionKeepAlive() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/auth/refresh", { method: "POST" }).catch(() => {});
    }, 10 * 60_000);
    return () => clearInterval(interval);
  }, []);
  return null;
}
