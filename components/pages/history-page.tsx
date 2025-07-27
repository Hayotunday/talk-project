"use client";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyMeetingsPage() {
  const [user, setUser] = useState<User | null>();

  const client = useStreamVideoClient();

  const [calls, setCalls] = useState<Call[]>();

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    fetchUser();

    async function loadCalls() {
      if (!client || !user?.uid) {
        return;
      }

      const { calls } = await client.queryCalls({
        sort: [{ field: "starts_at", direction: -1 }],
        filter_conditions: {
          starts_at: { $exists: true },
          $or: [
            { created_by_user_id: user.uid },
            { members: { $in: [user.uid] } },
          ],
        },
      });

      setCalls(calls);
    }

    loadCalls();
  }, [client, user?.uid]);

  return (
    <div className="space-y-3">
      <h1 className="text-center text-2xl font-bold">My Meetings</h1>
      {!calls && <Loader2 className="mx-auto animate-spin" />}
      {calls?.length === 0 && <p>No meetings found</p>}
      <ul className="list-inside list-disc space-y-2">
        {calls?.map((call) => (
          <MeetingItem key={call.id} call={call} />
        ))}
      </ul>
    </div>
  );
}

interface MeetingItemProps {
  call: Call;
}

function MeetingItem({ call }: MeetingItemProps) {
  const meetingLink = `/meeting/${call.id}`;

  const isInFuture =
    call.state.startsAt && new Date(call.state.startsAt) > new Date();

  const hasEnded = !!call.state.endedAt;

  return (
    <li>
      <Link href={meetingLink} className="hover:underline">
        {call.state.startsAt?.toLocaleString()}
        {isInFuture && " (Upcoming)"}
        {hasEnded && " (Ended)"}
      </Link>
      <p className="ml-6 text-gray-500">{call.state.custom.description}</p>
    </li>
  );
}
