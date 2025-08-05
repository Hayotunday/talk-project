import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Check for meeting ended event
  if (body.event_type === "call.ended") {
    const meetingId = body.call.id;
    const transcript = body.call.transcript; // Or fetch transcript if not included

    // Call your summary generation logic here
    // For example, POST to your summarize API
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, meetingId }),
    });
  }

  return Response.json({ success: true });
}
