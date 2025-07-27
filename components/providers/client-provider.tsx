"use client";

import { getCurrentUser } from "@/lib/actions/auth.action";
import { tokenProvider } from "@/lib/actions/stream.action";
import {
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  const videoClient = useInitializeVideoClient();

  if (!videoClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}

function useInitializeVideoClient() {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null
  );

  useEffect(() => {
    const createClient = async () => {
      const user = await getCurrentUser();

      if (!user) return;

      let streamUser: User;

      if (user?.uid) {
        streamUser = {
          id: user.uid,
          name: user.display_name || user.uid,
          image: user.photo_url,
        };
      } else {
        const id = nanoid();
        streamUser = {
          id,
          type: "guest",
          name: `Guest ${id}`,
        };
      }

      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

      if (!apiKey) {
        throw new Error("Stream API key not set");
      }

      const client = new StreamVideoClient({
        apiKey,
        user: streamUser,
        tokenProvider: user?.uid ? tokenProvider : undefined,
      });

      setVideoClient(client);

      return () => {
        client.disconnectUser();
        setVideoClient(null);
      };
    };

    createClient();
  }, []);

  return videoClient;
}
