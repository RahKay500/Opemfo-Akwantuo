import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getMotherDashboardData } from "@/lib/queries/mother-dashboard";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const data = await getMotherDashboardData(session.userId);
  if (!data) {
    return NextResponse.json({ error: "Patient record not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}
