import useStreamCall from "@/hooks/use-stream-call";
import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";

export default function EndCallButton() {
  const call = useStreamCall();

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const participantIsChannelOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!participantIsChannelOwner) {
    return null;
  }

  return (
    <Button onClick={call.endCall} className="bg-red-500 rounded-full">
      End call for everyone
    </Button>
  );
}
