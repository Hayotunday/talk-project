import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { callId } = await request.json();

    // Fetch transcript from stream-transcript API
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
      "http://localhost:3000";
    const transcriptRes = await fetch(`${baseUrl}/api/stream-transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId }),
    });
    const transcriptData = await transcriptRes.json();
    const transcript = transcriptData.transcript;

    if (!transcript) {
      return Response.json(
        { success: false, error: "Transcript not found" },
        { status: 404 }
      );
    }

    // Generate summary (your Gemini logic)
    const { text: summary } = await generateText({
      model: google("gemini-2.0-flash-001"),
      temperature: 0.7,
      system:
        "You are a helpful AI assistant that summarizes meeting transcriptions.",
      prompt: `
        Based on the following meeting transcription, please provide a concise summary.
        The summary should include:
        1.  A brief overview of the main topics discussed in 200-300 words
        2.  Highlighting key points, and decisions made during the meeting.
        3.  Action items assigned to participants, if any.

        Transcription:
        ---
        ${transcript}
        ---
        `,
    });

    // Save summary to Firestore
    if (callId) {
      await db.collection("meetings").doc(callId).update({
        summary,
      });
    }

    return Response.json({ success: true, summary }, { status: 200 });
  } catch (error: any) {
    console.error("Summarize API error:", error);
    return Response.json(
      { success: false, error: error?.message || error },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
