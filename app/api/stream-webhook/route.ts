import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.type;

    if (eventType === "call.ended") {
      const { call_cid } = body;
      if (!call_cid) {
        return NextResponse.json(
          { success: false, message: "call_cid is missing" },
          { status: 400 }
        );
      }
      const callId = call_cid.split(":")[1];
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
        "http://localhost:3000";

      // Asynchronously trigger transcript processing. The `stream-transcript`
      // route will then handle calling the `summarize` route.
      // We don't `await` this so the webhook can respond quickly to Stream.
      fetch(`${baseUrl}/api/stream-transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
      }).catch((error) => {
        console.error(
          `Webhook: Failed to trigger transcript processing for call ${callId}`,
          error
        );
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
