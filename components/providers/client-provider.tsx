"use client";

import { ReactNode, useEffect, useState } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { getCurrentUser } from "@/lib/actions/auth.action";

import { tokenProvider } from "@/lib/actions/stream.action";
import { Loader2 } from "lucide-react";
import AuthDialog from "../auth-dialog";
import CreateMeetingPage from "../pages/create-meeting-page";
import Navbar from "../nav-bar";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import SignInForm from "../sign-in-form";
import SignUpForm from "../sign-up-form";

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [type, setType] = useState<"login" | "register">("login");
  const [user, setUser] = useState<any | null>(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    const getVideoClient = async () => {
      const user = await getCurrentUser();
      setUser(user);

      if (!user) return;

      if (!API_KEY) throw new Error("Stream API key is missing");

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
    };

    getVideoClient();
  }, []);

  if (user === undefined) {
    // Still loading
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (user === null) {
    // User not logged in, show dialog
    return (
      <div>
        {type === "login" ? (
          <SignInForm onSwitch={() => setType("register")} />
        ) : (
          <SignUpForm onSwitch={() => setType("login")} />
        )}
      </div>
    );
  }

  if (!videoClient) {
    // User is logged in, but client is not ready yet
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamProvider;
