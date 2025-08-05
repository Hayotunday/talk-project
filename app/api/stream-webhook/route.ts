import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Check for meeting ended event
  if (body.event_type === "call.ended") {
    const callId = body.call.id;

    // Call summarize API with callId only
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId }),
    });
  }

  return Response.json({ success: true });
}
