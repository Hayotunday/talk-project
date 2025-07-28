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
  CallEndedEvent,
  DeviceSettings,
  StreamCall,
  StreamTheme,
  VideoPreview,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
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

  const [callHasEnded, setCallHasEnded] = useState(!!callEndedAt);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    const handleCallEnded = async (event: CallEndedEvent) => {
      console.log("Call ended event on client:", event);
      setCallHasEnded(true);

      // Trigger the backend process to fetch and save the transcription
      try {
        await fetch("/api/stream-transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId: call.id, callType: call.type }),
        });
      } catch (error) {
        console.error(
          "Failed to trigger backend processing for ended call:",
          error
        );
      }
    };
    call.on("call.ended", handleCallEnded);
    return () => call.off("call.ended", handleCallEnded);
  }, [call]);

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

  // const callHasEnded = !!callEndedAt;

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

function MeetingEndedScreen({ meetingId }: { meetingId: string }) {
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestedTranscript, setRequestedTranscript] = useState(false);

  useEffect(() => {
    const meetingRef = doc(db, "meetings", meetingId);

    const unsubscribe = onSnapshot(
      meetingRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.transcription && data.transcription.trim() !== "") {
            setTranscription(data.transcription);
            setIsLoading(false);
          } else {
            setTranscription(null);
            setIsLoading(true);
            // If transcription is missing and we haven't requested it yet, trigger the API
            if (!requestedTranscript) {
              setRequestedTranscript(true);
              try {
                await fetch("/api/stream-transcript", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ callId: meetingId }),
                });
              } catch (error) {
                console.error(
                  "Failed to request transcript generation:",
                  error
                );
                setIsLoading(false);
              }
            }
          }
        } else {
          console.error("Meeting document not found.");
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching transcription:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [meetingId, requestedTranscript]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-bold">This meeting has ended</p>
      <Link href="/" className={buttonClassName}>
        Go home
      </Link>
      <div className="w-full max-w-4xl space-y-3">
        <h2 className="text-center text-xl font-bold">Transcription</h2>
        {isLoading && <p className="text-center">Loading transcription...</p>}
        {!isLoading && !transcription && (
          <p className="text-center">
            No transcription available for this meeting.
          </p>
        )}
        {transcription && (
          <div className="p-4 border rounded-md bg-gray-100 dark:bg-gray-800 text-left">
            <p className="whitespace-pre-wrap text-sm max-h-96 overflow-y-auto border border-gray-300 p-2 rounded">
              {transcription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
