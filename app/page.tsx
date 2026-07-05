import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  MOTHER: "/mother/dashboard",
  MIDWIFE: "/midwife/dashboard",
  DOCTOR: "/doctor/dashboard",
};

export default async function Splash() {
  const accessToken = cookies().get("access_token")?.value;

  if (accessToken) {
    try {
      const { role } = await verifyAccessToken(accessToken);
      redirect(ROLE_HOME[role] ?? "/login");
    } catch {
      redirect("/login");
    }
  }

  redirect("/login");
}
