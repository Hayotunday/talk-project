"use client";

import Button from "@/components/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  Call,
  MemberRequest,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { generateRandomId } from "@/lib/utils";

export default function CreateMeetingPage() {
  const [descriptionInput, setDescriptionInput] = useState("");
  const [user, setUser] = useState<User | null>();

  const [call, setCall] = useState<Call>();

  const client = useStreamVideoClient();

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    fetchUser();
  }, []);

  async function createMeeting() {
    if (!user) {
      toast.error("User needs to sign in to create a meeting.");
      return;
    }
    if (!client) {
      toast.error("Something went wrong. Please try again later.");
      return;
    }

    try {
      const id = generateRandomId();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create meeting");
      const starts_at = new Date(Date.now()).toISOString();
      const description = descriptionInput || "Instant Meeting";
      await call.getOrCreate({
        data: {
          starts_at,
          custom: {
            description,
          },
        },
      });
      // const memberIds = await getUserIds(memberEmails);

      await call.getOrCreate({
        data: {
          starts_at,
          custom: { description: descriptionInput },
        },
      });

      await setDoc(doc(db, "meetings", call.id), {
        title: description,
        createdBy: user.uid,
        participants: [user.uid],
        createdAt: new Date(),
        summary: "",
        transcription: "",
      });
      toast.success("Meeting Created Successfully!");

      setCall(call);
    } catch (error) {
      console.error(error);
      if (!user) {
        toast.error("User needs to sign in to create a meeting.");
        return;
      }
      if (!client) {
        toast.error("Something went wrong. Please try again later.");
        return;
      }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {user && (
        <h1 className="text-center text-2xl font-bold">
          Welcome {user.display_name}!
        </h1>
      )}
      <div className="mx-auto w-80 space-y-6 rounded-md bg-slate-100 p-5">
        <h2 className="text-xl font-bold">Create a new meeting</h2>
        <DescriptionInput
          value={descriptionInput}
          onChange={setDescriptionInput}
        />
        <Button onClick={createMeeting} className="w-full">
          Create meeting
        </Button>
      </div>
      {call && <MeetingLink call={call} />}
    </div>
  );
}

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-2">
      <div className="font-medium">Meeting info:</div>
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => {
            setActive(e.target.checked);
            onChange("");
          }}
        />
        Add description
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Description</span>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={500}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </label>
      )}
    </div>
  );
}

interface MeetingLinkProps {
  call: Call;
}

function MeetingLink({ call }: MeetingLinkProps) {
  const meetingLink = `${process.env.NEXT_PUBLIC_LOCAL_URL_ORIGIN}/meeting/${call.id}`;

  return (
    <div className="flex flex-col items-center gap-3 text-center p-5 rounded-md shadow shadow-black">
      <div className="flex items-center gap-3 cursor-pointer">
        <span>
          Invitation link: {"  "}
          <Link href={meetingLink} className="font-medium hover:underline">
            {meetingLink}
          </Link>
        </span>

        <Button
          title="Copy invitation link"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast.success("Meeting link copied to clipboard");
          }}
          className=""
        >
          <Copy className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function getMailToLink(
  meetingLink: string,
  startsAt?: Date,
  description?: string
) {
  const startDateFormatted = startsAt
    ? startsAt.toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : undefined;

  const subject =
    "Join my meeting" + (startDateFormatted ? ` at ${startDateFormatted}` : "");

  const body =
    `Join my meeting at ${meetingLink}.` +
    (startDateFormatted
      ? `\n\nThe meeting starts at ${startDateFormatted}.`
      : "") +
    (description ? `\n\nDescription: ${description}` : "");

  return `mailto:?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
