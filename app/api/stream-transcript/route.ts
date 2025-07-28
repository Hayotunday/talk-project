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

        const meetingRef = db.collection("meetings").doc(callId);
        // await meetingRef.update({
        //   transcription: transcriptionText,
        // });
        // console.log(`Transcription: ${transcriptionText}`);
        console.log(`Transcription for call ${callId} saved to Firebase.`);

        // Summarize the transcript and save summary
        try {
          // Build absolute URL for server-side fetch
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
            "http://localhost:3000";
          const summaryRes = await fetch(`${baseUrl}/api/summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: transcriptionText }),
          });
          const { summary } = await summaryRes.json();
          if (summary) {
            await meetingRef.update({ summary });
            console.log(`Summary for call ${callId} saved to Firebase.`);
          }
        } catch (err) {
          console.error("Failed to summarize transcript:", err);
        }
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
