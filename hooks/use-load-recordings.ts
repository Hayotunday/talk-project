import { getCurrentUser } from "@/lib/actions/auth.action";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export default function useLoadRecordings(call: Call) {
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [recordingsLoading, setRecordingsLoading] = useState(true);

  useEffect(() => {
    async function loadRecordings() {
      const user = await getCurrentUser();
      setRecordingsLoading(true);

      if (!user?.uid) return;

      const { recordings } = await call.queryRecordings();
      setRecordings(recordings);

      setRecordingsLoading(false);
    }

    loadRecordings();
  }, [call]);

  return { recordings, recordingsLoading };
}
