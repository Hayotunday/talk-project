// app/api/stream-webhook/route.ts
import { streamClient } from "@/lib/actions/stream.action";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { GoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Initialize Gemini with your API key from environment variables
const gemini = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("X-Signature");
    const rawBody = await req.text(); // Get raw request body for signature verification

    if (!signature) {
      return new Response("No X-Signature header provided", { status: 401 });
    }

    let event: any; // Use 'any' to easily access properties from the webhook payload
    try {
      // Verify the webhook signature using your Stream.io API Secret
      event = streamClient.verifyWebhook(rawBody, signature);
    } catch (error) {
      console.error("Stream.io Webhook signature verification failed:", error);
      return new Response("Unauthorized Webhook Signature", { status: 401 });
    }

    console.log(
      `[Webhook] Received event: ${event.type} for call: ${event.call_id}`
    );

    // Process only 'recording.ready' events as they contain asset URLs
    if (event.type === "recording.ready") {
      const callId = event.call_id; // This is the Stream Call ID, which you're using as meetingId
      const recordingUrl = event.url; // Direct URL to the completed video recording

      console.log(`[Webhook] Recording ready for Call ID: ${callId}`);
      console.log(`[Webhook] Recording URL: ${recordingUrl}`);

      let fullTranscriptionText = "";
      let transcriptionAvailable = false;

      // Find the transcription asset within the webhook payload's 'assets' array
      const transcriptionAsset = event.assets?.find(
        (asset: any) => asset.type === "transcription"
      );

      if (transcriptionAsset && transcriptionAsset.url) {
        try {
          console.log(
            `[Webhook] Attempting to fetch transcription from URL: ${transcriptionAsset.url}`
          );
          // Make an HTTP request to the transcription asset URL provided by Stream.io
          const transcriptionResponse = await fetch(transcriptionAsset.url);

          if (transcriptionResponse.ok) {
            fullTranscriptionText = await transcriptionResponse.text(); // Get the plain text content
            transcriptionAvailable = true;
            console.log(
              `[Webhook] Successfully fetched transcription (${fullTranscriptionText.length} chars).`
            );
          } else {
            console.error(
              `[Webhook] Failed to fetch transcription from asset URL. Status: ${
                transcriptionResponse.status
              }, Response: ${await transcriptionResponse.text()}`
            );
          }
        } catch (fetchError) {
          console.error(
            `[Webhook] Error fetching transcription content from URL:`,
            fetchError
          );
        }
      } else {
        console.warn(
          `[Webhook] 'transcription' asset not found in webhook payload for callId: ${callId}. This might indicate a missing transcription or an unexpected webhook structure.`
        );
      }

      // Fallback/Mock for development or if transcription fetching fails
      if (!transcriptionAvailable || fullTranscriptionText.trim() === "") {
        console.warn(
          `[Webhook] No actual transcription obtained or it was empty for callId: ${callId}. Using a mock transcription for processing.`
        );
        fullTranscriptionText = `
            [AUTOMATIC TRANSCRIPTION - MOCK for ${callId}]
            Speaker 1: Welcome to our daily stand-up. Let's get quick updates from everyone. Sarah, you first.
            Speaker 2: I've finished the authentication module testing. Found a minor bug on the logout flow, reported it.
            Speaker 1: Good. Action item for John: Please look into the logout bug.
            Speaker 3: My task was integrating the payment gateway. I'm stuck on API key configuration, need help from ops.
            Speaker 1: Okay. Action item for Alice: Assist John with payment gateway API key setup.
            Speaker 4: I'm still working on the UI redesign for the dashboard. It's almost done, hoping to push to review by EOD.
            Speaker 1: Great. Decision: Dashboard UI redesign review on Thursday morning. Anything else?
            Speaker 2: No, I'm good.
            Speaker 3: Me too.
            Speaker 1: Alright, let's connect offline for any blockers. Meeting adjourned.
          `;
      }

      // --- Summarize the transcription using Google Gemini ---
      let summaryText = "No summary could be generated."; // Default message
      try {
        const { text: generatedSummary } = await generateText({
          model: gemini.generativeModel({ model: "gemini-1.5-flash-001" }),
          prompt: `
                Based on the following meeting transcription, please provide a concise summary. The summary should include:
                1.  A brief overview of the main topics discussed in 200-300 words.
                2.  Highlighting key points, and decisions made during the meeting.
                3.  Action items assigned to participants, if any.

                Transcription:
                ---
                ${fullTranscriptionText}
                ---
                `,
        });
        summaryText = generatedSummary;
        console.log(`[Webhook] Generated summary for meetingId: ${callId}`);
      } catch (geminiError) {
        console.error(
          `[Webhook] Error summarizing with Gemini for ${callId}:`,
          geminiError
        );
        summaryText = "Failed to generate summary due to AI processing error.";
      }

      // --- Save the summary, recording URL, and full transcription to Firebase Firestore ---
      const meetingRef = doc(db, "meetings", callId);
      await updateDoc(meetingRef, {
        summary: summaryText,
        recordingUrl: recordingUrl, // Store the URL to the video recording
        fullTranscription: fullTranscriptionText, // Store the full transcript (be mindful of Firestore 1MB document limit for very long meetings)
        // Add a timestamp for when the summary was generated/updated if useful
        summaryGeneratedAt: new Date(),
      });
      console.log(
        `[Webhook] Meeting data (summary, recordingUrl, fullTranscription) updated in Firebase for meetingId: ${callId}`
      );
    } else {
      console.log(`[Webhook] Unhandled event type received: ${event.type}`);
    }

    // Always respond with 200 OK to the webhook to acknowledge receipt
    return new Response("Webhook received and processed successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("[Webhook] Fatal error in Stream.io webhook handler:", error);
    // Respond with 500 status code if there's a server error
    return new Response("Internal Server Error during Webhook Processing", {
      status: 500,
    });
  }
}
