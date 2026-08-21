"use client";

import { useEffect } from "react";
import { markOnboardingSeen } from "@/lib/onboarding-seen";

// Renders nothing — just records that this browser reached onboarding, so
// the splash redirect can skip straight to sign-in on a future visit.
export default function OnboardingSeenMarker() {
  useEffect(() => {
    markOnboardingSeen();
  }, []);
  return null;
}
