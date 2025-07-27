"use client";

import AudioVolumeIndicator from "@/components/audio-volume-indicator";
import Button, { buttonClassName } from "@/components/button";
import FlexibleCallLayout from "@/components/flexible-call-layout";
import PermissionPrompt from "@/components/permission-prompt";
import RecordingsList from "@/components/recordings-list";
import useLoadCall from "@/hooks/use-load-calls";
import useStreamCall from "@/hooks/use-stream-call";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  CallingState,
  DeviceSettings,
  StreamCall,
  StreamTheme,
  VideoPreview,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

interface MeetingPageProps {
  id: string;
}

export default function MeetingPage({ id }: MeetingPageProps) {
  const [user, setUser] = useState<User | null>();

  const { call, callLoading } = useLoadCall(id);

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    fetchUser();
  }, []);

  if (!user || callLoading) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (!call) {
    return <p className="text-center font-bold">Call not found</p>;
  }

  const notAllowedToJoin =
    call.type === "private-meeting" &&
    (!user || !call.state.members.find((m) => m.user.id === user.uid));

  if (notAllowedToJoin) {
    return (
      <p className="text-center font-bold">
        You are not allowed to view this meeting
      </p>
    );
  }

  return (
    <StreamCall call={call}>
      <StreamTheme>
        <MeetingScreen meetingId={id} />
      </StreamTheme>
    </StreamCall>
  );
}

function MeetingScreen({ meetingId }: { meetingId: string }) {
  const call = useStreamCall();

  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();

  const callEndedAt = useCallEndedAt();
  const callStartsAt = useCallStartsAt();

  const [setupComplete, setSetupComplete] = useState(false);

  async function handleSetupComplete() {
    try {
      const user = await getCurrentUser();
      if (user) {
        const meetingRef = doc(db, "meetings", meetingId);
        await updateDoc(meetingRef, {
          participants: arrayUnion(user.uid),
        });
      }
    } catch (error) {
      console.error("Error updating participants:", error);
    }
    call.join();
    setSetupComplete(true);
  }

  const callIsInFuture = callStartsAt && new Date(callStartsAt) > new Date();

  const callHasEnded = !!callEndedAt;

  if (callHasEnded) {
    return <MeetingEndedScreen meetingId={meetingId} />;
  }

  if (callIsInFuture) {
    return <UpcomingMeetingScreen />;
  }

  const description = call.state.custom.description;

  return (
    <div className="space-y-6">
      {description && (
        <p className="text-center">
          Meeting description: <span className="font-bold">{description}</span>
        </p>
      )}
      {setupComplete ? (
        <CallUI />
      ) : (
        <SetupUI onSetupComplete={handleSetupComplete} />
      )}
    </div>
  );
}

interface SetupUIProps {
  onSetupComplete: () => void;
}

function SetupUI({ onSetupComplete }: SetupUIProps) {
  const call = useStreamCall();

  const { useMicrophoneState, useCameraState } = useCallStateHooks();

  const micState = useMicrophoneState();
  const camState = useCameraState();

  const [micCamDisabled, setMicCamDisabled] = useState(false);

  useEffect(() => {
    if (micCamDisabled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [micCamDisabled, call]);

  if (!micState.hasBrowserPermission || !camState.hasBrowserPermission) {
    return <PermissionPrompt />;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
      <VideoPreview />
      <div className="flex h-16 items-center gap-3">
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={micCamDisabled}
            onChange={(e) => setMicCamDisabled(e.target.checked)}
          />
          Join with mic and camera off
        </label>
        <AudioVolumeIndicator />
        <DeviceSettings />
      </div>
      <Button onClick={onSetupComplete}>Join meeting</Button>
    </div>
  );
}

function CallUI() {
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  return <FlexibleCallLayout />;
}

function UpcomingMeetingScreen() {
  const call = useStreamCall();

  return (
    <div className="flex flex-col items-center gap-6">
      <p>
        This meeting has not started yet. It will start at{" "}
        <span className="font-bold">
          {call.state.startsAt?.toLocaleString()}
        </span>
      </p>
      {call.state.custom.description && (
        <p>
          Description:{" "}
          <span className="font-bold">{call.state.custom.description}</span>
        </p>
      )}
      <Link href="/" className={buttonClassName}>
        Go home
      </Link>
    </div>
  );
}

// Updated MeetingEndedScreen to listen for Firebase updates
function MeetingEndedScreen({ meetingId }: { meetingId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [fullTranscription, setFullTranscription] = useState<string | null>(
    null
  );
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [errorFetchingAssets, setErrorFetchingAssets] = useState(false);

  useEffect(() => {
    // Reference to the specific meeting document in Firestore
    const meetingRef = doc(db, "meetings", meetingId);

    // Set up a real-time listener for changes to this document
    const unsubscribe = onSnapshot(
      meetingRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const meetingData = docSnap.data();
          // Check if summary and recordingUrl (and optionally fullTranscription) are available
          if (meetingData.summary && meetingData.recordingUrl) {
            setSummary(meetingData.summary);
            setRecordingUrl(meetingData.recordingUrl);
            setFullTranscription(meetingData.fullTranscription || null); // Handle optional fullTranscription
            setLoadingAssets(false);
            setErrorFetchingAssets(false); // Clear error if assets are now available
          } else {
            // Assets not yet available, keep loading state
            setLoadingAssets(true);
            setSummary(null);
            setRecordingUrl(null);
            setFullTranscription(null);
            setErrorFetchingAssets(false); // Clear any previous error if data is now loading
          }
        } else {
          // Meeting document not found (this should ideally not happen for an existing meeting)
          console.error("Meeting document not found for ID:", meetingId);
          setLoadingAssets(false);
          setErrorFetchingAssets(true);
          setSummary("Meeting details not found.");
        }
      },
      (error) => {
        // Handle errors from the Firestore listener
        console.error(
          "Error listening to meeting document in Firebase:",
          error
        );
        setLoadingAssets(false);
        setErrorFetchingAssets(true);
        setSummary("Error retrieving meeting details from Firebase.");
      }
    );

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [meetingId]); // Re-run effect if meetingId changes

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-bold">This meeting has ended</p>
      <Link href="/" className={buttonClassName}>
        Go home
      </Link>
      <div className="space-y-3">
        <h2 className="text-center text-xl font-bold">Meeting Assets</h2>
        {loadingAssets && (
          <p className="text-gray-600">
            Generating meeting summary, fetching recording, and transcription...
            This may take a moment.
          </p>
        )}
        {errorFetchingAssets && (
          <p className="text-red-500">
            {summary ||
              "An error occurred while fetching meeting assets. Please try again later."}
          </p>
        )}

        {/* Display Summary */}
        {summary && !loadingAssets && !errorFetchingAssets && (
          <div className="p-4 border rounded-md bg-gray-100 dark:bg-gray-800 text-left w-full max-w-2xl">
            <h3 className="font-semibold mb-2">Meeting Summary:</h3>
            <p className="whitespace-pre-wrap">{summary}</p>
          </div>
        )}

        {/* Display Recording Link */}
        {recordingUrl && !loadingAssets && !errorFetchingAssets && (
          <div className="p-4 border rounded-md bg-gray-100 dark:bg-gray-800 text-left w-full max-w-2xl">
            <h3 className="font-semibold mb-2">Meeting Recording:</h3>
            <p>
              <a
                href={recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View Recording
              </a>
            </p>
          </div>
        )}

        {/* Display Full Transcription (optional, with scroll) */}
        {fullTranscription && !loadingAssets && !errorFetchingAssets && (
          <div className="p-4 border rounded-md bg-gray-100 dark:bg-gray-800 text-left w-full max-w-2xl">
            <h3 className="font-semibold mb-2">Full Transcription:</h3>
            <p className="whitespace-pre-wrap text-sm max-h-60 overflow-y-auto border border-gray-300 p-2 rounded">
              {fullTranscription}
            </p>
          </div>
        )}

        {/* This RecordingsList component might fetch other recordings or be empty depending on its implementation */}
        <RecordingsList />
      </div>
    </div>
  );
}
