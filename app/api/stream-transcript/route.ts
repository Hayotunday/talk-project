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

    // It can take a moment for the transcription to be ready.
    // It's still a good idea to have a delay, or ideally, use webhooks for production.
    await new Promise((resolve) => setTimeout(resolve, 20000)); // Increased delay as a precaution

    const call = streamClient.video.call(callType, callId);

    // Optional: Fetch call details to ensure it's valid if needed for other operations
    // try {
    //   await call.get();
    // } catch (e) {
    //   console.error(`Error fetching call ${callId}:`, e);
    //   return NextResponse.json(
    //     { error: "Call not found or accessible" },
    //     { status: 404 }
    //   );
    // }

    // Corrected: Use call.listTranscriptions()
    const { transcriptions } = await call.listTranscriptions();

    if (transcriptions.length > 0) {
      // Assuming you want the first transcription if multiple exist
      const transcriptionUrl = transcriptions[0].url;
      if (transcriptionUrl) {
        const response = await fetch(transcriptionUrl);
        const transcriptionText = await response.text();

        const meetingRef = db.collection("meetings").doc(callId);
        await meetingRef.update({
          transcription: transcriptionText,
        });
        // console.log(`Transcription: ${transcriptionText}`);
        console.log(`Transcription for call ${callId} saved to Firebase.`);
      } else {
        console.log(`First transcription for call ${callId} has no URL.`);
      }
    } else {
      console.log(`No transcriptions found for call ${callId}.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing ended call:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to process call", details: errorMessage },
      { status: 500 }
    );
  }
}
