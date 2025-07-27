import { buttonClassName } from "@/components/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

export default function MeetingLeft({ params: { id } }: PageProps) {
  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <p className="font-bold">You left this meeting.</p>
      <Link
        href={`/meeting/${id}`}
        className={cn(buttonClassName, "bg-gray-500 hover:bg-gray-600")}
      >
        Rejoin
      </Link>
      <p className="font-bold">
        Check your meeting history to get meeting summary.
      </p>
    </div>
  );
}
