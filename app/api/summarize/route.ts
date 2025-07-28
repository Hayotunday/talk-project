import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  const { transcript, meetingId } = await request.json();

  try {
    const { text: questions } = await generateText({
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

    if (meetingId) {
      await db.collection("meetings").doc(meetingId).update({
        summary: questions,
      });
    }

    return Response.json(
      { success: true, summary: questions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
