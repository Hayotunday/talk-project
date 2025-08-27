"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

interface MeetingSummary {
  id: string;
  title: string;
  summary: string;
  createdAt: any;
  createdBy: string;
  createdByDisplayName?: string;
  participants: string[];
  participantDisplayNames?: string[];
}

interface SummaryListProps {
  filterByUserId?: string;
}

export default function SummaryList({ filterByUserId }: SummaryListProps) {
  const [summaries, setSummaries] = useState<MeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummaries() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "meetings"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data: MeetingSummary[] = [];
        for (const docSnap of querySnapshot.docs) {
          const d = docSnap.data();
          if (
            !filterByUserId ||
            (Array.isArray(d.participants) &&
              d.participants.includes(filterByUserId))
          ) {
            let createdByDisplayName = d.createdBy;
            let participantDisplayNames: string[] = [];
            try {
              const creatorDocRef = doc(collection(db, "users"), d.createdBy);
              const creatorDoc = await getDoc(creatorDocRef);
              if (creatorDoc.exists()) {
                createdByDisplayName =
                  creatorDoc.data().display_name || d.createdBy;
              }
              // Fetch display names for participants using modular API
              if (Array.isArray(d.participants)) {
                const userDocs = await Promise.all(
                  d.participants.map((uid: string) => {
                    const userDocRef = doc(collection(db, "users"), uid);
                    return getDoc(userDocRef);
                  })
                );
                participantDisplayNames = userDocs.map((userDoc, idx) =>
                  userDoc.exists()
                    ? userDoc.data().display_name || d.participants[idx]
                    : d.participants[idx]
                );
              }
            } catch (e) {
              createdByDisplayName = d.createdBy;
              participantDisplayNames = d.participants || [];
            }

            data.push({
              id: docSnap.id,
              title: d.title || "",
              summary: d.summary || "",
              createdAt: d.createdAt,
              createdBy: d.createdBy,
              createdByDisplayName,
              participants: d.participants || [],
              participantDisplayNames,
            });
          }
        }
        setSummaries(data);
      } catch (err) {
        setSummaries([]);
      }
      setLoading(false);
    }
    fetchSummaries();
  }, [filterByUserId]);

  const handleDownloadPDF = (summary: string, title: string, id: string) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title ? `Meeting Summary: ${title}` : "Meeting Summary", 10, 15);
    doc.setFontSize(12);
    doc.text(summary || "No summary available.", 10, 25, { maxWidth: 180 });
    doc.save(`meeting-summary-${id}.pdf`);
  };

  if (loading) return <Loader2 className="mx-auto animate-spin" />;

  return (
    <div className="space-y-4">
      {summaries.length === 0 && (
        <p className="text-center">No meeting summaries available.</p>
      )}
      <ul className="space-y-4">
        {summaries.map((meeting) => (
          <li
            key={meeting.id}
            className="border rounded p-4 bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{meeting.title}</span>
              <button
                onClick={() =>
                  handleDownloadPDF(meeting.summary, meeting.title, meeting.id)
                }
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
              >
                Download PDF
              </button>
            </div>
            <div className="text-sm text-left whitespace-pre-wrap mb-2">
              {meeting.summary ? (
                meeting.summary
              ) : (
                <span className="italic text-gray-500">
                  No summary available.
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 flex flex-wrap gap-4">
              <span>
                <b>Created:</b>{" "}
                {meeting.createdAt?.toDate
                  ? meeting.createdAt.toDate().toLocaleString()
                  : new Date(meeting.createdAt).toLocaleString()}
              </span>
              <span>
                <b>By:</b> {meeting.createdByDisplayName || meeting.createdBy}
              </span>
              <span>
                <b>Participants:</b>{" "}
                {meeting.participantDisplayNames
                  ? meeting.participantDisplayNames.join(", ")
                  : meeting.participants.join(", ")}
              </span>
              <span>
                <b>Meeting ID:</b> {meeting.id}
              </span>
              {/* If you want to show a clickable link, use below */}
              {/* <span>
                <b>Meeting Link:</b>{" "}
                <a
                  href={`/meeting/${meeting.id}`}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`/meeting/${meeting.id}`}
                </a>
              </span> */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
