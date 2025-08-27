import { db } from "@/lib/firebase/admin";
import { StreamClient } from "@stream-io/node-sdk";
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

    // It can take a few moments for the transcription to be ready after the call ends.
    // A delay helps ensure the transcription is available when we query for it.
    await new Promise((resolve) => setTimeout(resolve, 30000));

    const call = streamClient.video.call(callType, callId);
    const { transcriptions } = await call.listTranscriptions();

    if (transcriptions.length > 0 && transcriptions[0].url) {
      const transcriptionUrl = transcriptions[0].url;
      const response = await fetch(transcriptionUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch transcription: ${response.statusText}`
        );
      }
      const transcriptionText = await response.text();

      // Save transcription to Firestore
      const meetingRef = db.collection("meetings").doc(callId);
      await meetingRef.set(
        { transcription: transcriptionText },
        { merge: true }
      );
      console.log(`Transcription for call ${callId} saved to Firestore.`);

      // After saving the transcript, trigger summarization
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
        "http://localhost:3000";

      // We don't need to wait for the summarization to finish
      fetch(`${baseUrl}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
      }).catch((error) => {
        console.error(
          `Failed to trigger summarization for call ${callId}`,
          error
        );
      });

      console.log(`Summarization for call ${callId} triggered.`);
    } else {
      console.log(`No transcriptions found for call ${callId}.`);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing transcript:", error);
    const errorMessage = error?.message ?? "Unknown error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
