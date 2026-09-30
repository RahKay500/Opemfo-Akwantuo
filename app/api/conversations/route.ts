import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { resolveConversation } from "@/lib/conversations";

// Staff-only: find-or-create a conversation with a patient, with no message
// yet — used by the "Message" button on a patient's record, so staff land
// on an empty thread ready for their own first message instead of an
// auto-generated greeting.
export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || (session.role !== "MIDWIFE" && session.role !== "DOCTOR")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const patientId = body?.patientId;
  if (typeof patientId !== "string" || !patientId) {
    return NextResponse.json({ error: "Missing patient." }, { status: 400 });
  }

  const resolved = await resolveConversation(session, { patientId });
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  return NextResponse.json({ conversationId: resolved.id });
}
