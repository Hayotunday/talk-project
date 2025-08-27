import { google } from "@ai-sdk/google";
import { db } from "@/lib/firebase/admin";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { callId } = await req.json();

    if (!callId) {
      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 }
      );
    }

    const meetingRef = db.collection("meetings").doc(callId);
    const meetingDoc = await meetingRef.get();

    if (!meetingDoc.exists) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const transcript = meetingDoc.data()?.transcription;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not available for this meeting yet" },
        { status: 400 }
      );
    }

    const { text: summary } = await generateText({
      model: google("models/gemini-1.5-flash-latest"),
      system: `You are a helpful assistant that summarizes meeting transcripts.
        Provide a concise summary of the following transcript.`,
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

    if (summary) {
      await meetingRef.update({ summary });
      console.log(`Summary for call ${callId} saved to Firebase.`);
    }

    // console.log("Summary generated:", summary);

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("Error summarizing transcript:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
