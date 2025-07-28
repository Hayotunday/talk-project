"use client";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import SummaryList from "@/components/summary-list";

export default function MyMeetingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setUserId(currentUser?.uid ?? null);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  if (!userId) {
    return (
      <p className="text-center">
        You must be logged in to view your meeting summaries.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-center text-2xl font-bold">My Meeting Summaries</h1>
      <SummaryList filterByUserId={userId} />
    </div>
  );
}
