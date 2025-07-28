"use client";

import { useParams } from "next/navigation";
import MeetingPage from "@/components/pages/meeting-page";

export default function Page() {
  const { id } = useParams();

  return <MeetingPage id={id! as string} />;
}
