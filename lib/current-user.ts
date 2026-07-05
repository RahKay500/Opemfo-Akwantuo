import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

export async function getCurrentUser() {
  const accessToken = cookies().get("access_token")?.value;
  if (!accessToken) return null;

  try {
    const { userId } = await verifyAccessToken(accessToken);
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, role: true, facilityId: true },
    });
  } catch {
    return null;
  }
}
