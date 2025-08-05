import { StreamClient } from "@stream-io/node-sdk";
import { db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const { callId, callType = "default" } = await req.json();

    if (!callId) {
      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 }
      );
    }

    if (!STREAM_API_KEY) throw new Error("Stream API key secret is missing");
    if (!STREAM_API_SECRET) throw new Error("Stream API secret is missing");

    const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

    await new Promise((resolve) => setTimeout(resolve, 30000)); // Increased delay as a precaution

    const call = streamClient.video.call(callType, callId);
    const { transcriptions } = await call.listTranscriptions();

    if (transcriptions.length > 0) {
      const transcriptionUrl = transcriptions[0].url;
      if (transcriptionUrl) {
        const response = await fetch(transcriptionUrl);
        const transcriptionText = await response.text();

        // Optionally save to Firestore
        const meetingRef = db.collection("meetings").doc(callId);
        await meetingRef.update({ transcription: transcriptionText });

        return NextResponse.json({ transcript: transcriptionText });
      }
    }
    return NextResponse.json({ transcript: null });
  } catch (error: any) {
    console.error("Error fetching transcript:", error);
    const errorMessage = error?.message ?? "Unknown error";
    return NextResponse.json(
      { transcript: null, error: errorMessage },
      { status: 500 }
    );
  }
}
