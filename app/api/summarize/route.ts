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
    }).catch((err) => {
      // Log the error and throw for catch block
      console.error("Gemini API error:", err);
      throw err;
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
  } catch (error: any) {
    // Log error details
    console.error("Error:", error);
    // If error has a response, log it
    if (error?.response) {
      const errorText = await error.response.text?.();
      console.error("API response:", errorText);
    }
    return Response.json(
      { success: false, error: error?.message || error },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
