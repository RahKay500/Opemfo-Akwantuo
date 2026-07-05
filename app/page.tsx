import { cookies } from "next/headers";
import SplashRedirect from "@/app/_components/SplashRedirect";
import { verifyAccessToken } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  MOTHER: "/mother/dashboard",
  MIDWIFE: "/midwife/dashboard",
  DOCTOR: "/doctor/dashboard",
};

export default async function Splash() {
  const accessToken = cookies().get("access_token")?.value;
  let target = "/onboarding";

  if (accessToken) {
    try {
      const { role } = await verifyAccessToken(accessToken);
      target = ROLE_HOME[role] ?? "/onboarding";
    } catch {
      target = "/onboarding";
    }
  }

  return <SplashRedirect target={target} />;
}
