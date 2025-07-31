"use client";

import { ReactNode, useEffect, useState } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { tokenProvider } from "@/lib/actions/stream.action";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { Loader2 } from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!API_KEY) {
      setIsLoading(false);
      throw new Error("Stream API key is missing");
    }

    // onAuthStateChanged is the key. It's a listener that fires whenever the
    // Firebase client-side auth state changes (sign-in, sign-out).
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // User is signed in on the client.
          // Now, get our full user profile from the server action.
          const user = await getCurrentUser();
          if (user) {
            const client = new StreamVideoClient({
              apiKey: API_KEY,
              user: {
                id: user.uid,
                name: user.display_name || user.uid,
                image: user.photo_url,
              },
              tokenProvider,
            });
            setVideoClient(client);
          }
        } else {
          // User is signed out.
          videoClient?.disconnectUser();
          setVideoClient(undefined);
        }
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
      videoClient?.disconnectUser();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!videoClient) {
    return <>{children}</>;
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamProvider;
