"use client";

import { useEffect } from "react";

// Rotates the access/refresh token pair every 10 minutes so a session stays
// alive past the 15-minute access token expiry while the tab is open — this
// matters most for someone dwelling on one page (e.g. filling out a long
// form) without navigating, since middleware's own silent-refresh only fires
// on a fresh page/API request. No UI — this is what makes "refresh" visibly
// work (you just don't get logged out), rather than something with its own
// button to click.
export default function SessionKeepAlive() {
  useEffect(() => {
    async function refresh() {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (!res.ok) console.error(`Session refresh failed (${res.status})`);
      } catch (err) {
        console.error("Session refresh request failed", err);
      }
    }

    const interval = setInterval(refresh, 10 * 60_000);

    // A backgrounded/suspended tab can miss interval ticks entirely — catch
    // up immediately when it becomes visible again instead of waiting for
    // the next scheduled tick (which may already be too late).
    function handleVisibility() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
  return null;
}
