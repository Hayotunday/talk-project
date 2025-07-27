import useStreamCall from "@/hooks/use-stream-call";
import {
  CallControls,
  CancelCallButton,
  PaginatedGridLayout,
  ParticipantView,
  ScreenShareButton,
  SpeakerLayout,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
} from "@stream-io/video-react-sdk";
import {
  BetweenHorizonalEnd,
  BetweenVerticalEnd,
  LayoutGrid,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EndCallButton from "@/components/end-call-button";

type CallLayout = "speaker-vert" | "speaker-horiz" | "grid";

export default function FlexibleCallLayout() {
  const [layout, setLayout] = useState<CallLayout>("speaker-vert");

  const call = useStreamCall();

  const router = useRouter();

  return (
    <div className="space-y-3">
      <CallLayoutButtons layout={layout} setLayout={setLayout} />
      <CallLayoutView layout={layout} />
      {/* <CallControls onLeave={() => router.push(`/meeting/${call.id}/left`)} /> */}
      <div className="flex flex-row justify-center items-center space-x-3 gap-2">
        <ToggleAudioPublishingButton />
        <ToggleVideoPublishingButton />
        <ScreenShareButton />
        <CancelCallButton
          onLeave={() => router.push(`/meeting/${call.id}/left`)}
        />
        <EndCallButton />
      </div>
    </div>
  );
}

interface CallLayoutButtonsProps {
  layout: CallLayout;
  setLayout: (layout: CallLayout) => void;
}

function CallLayoutButtons({ layout, setLayout }: CallLayoutButtonsProps) {
  return (
    <div className="mx-auto w-fit space-x-6">
      <button onClick={() => setLayout("speaker-vert")}>
        <BetweenVerticalEnd
          className={layout !== "speaker-vert" ? "text-gray-400" : ""}
        />
      </button>
      <button onClick={() => setLayout("speaker-horiz")}>
        <BetweenHorizonalEnd
          className={layout !== "speaker-horiz" ? "text-gray-400" : ""}
        />
      </button>
      <button onClick={() => setLayout("grid")}>
        <LayoutGrid className={layout !== "grid" ? "text-gray-400" : ""} />
      </button>
    </div>
  );
}

interface CallLayoutViewProps {
  layout: CallLayout;
}

function CallLayoutView({ layout }: CallLayoutViewProps) {
  if (layout === "speaker-vert") {
    return <SpeakerLayout />;
  }

  if (layout === "speaker-horiz") {
    return <SpeakerLayout participantsBarPosition="right" />;
  }

  if (layout === "grid") {
    return <PaginatedGridLayout />;
  }

  return null;
}
