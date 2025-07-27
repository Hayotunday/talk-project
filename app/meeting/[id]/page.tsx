import { getCurrentUser } from "@/lib/actions/auth.action";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import MeetingPage from "@/components/pages/meeting-page";

interface PageProps {
  params: { id: string };
  searchParams: { guest: string };
}

export function generateMetadata({ params: { id } }: PageProps): Metadata {
  return {
    title: `Meeting ${id}`,
  };
}

export default async function Page({
  params: { id },
  searchParams: { guest },
}: PageProps) {
  const user = await getCurrentUser();

  const guestMode = guest === "true";

  if (!user && !guestMode) {
    return redirect("/auth");
  }

  return <MeetingPage id={id} />;
}
