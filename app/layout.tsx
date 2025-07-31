import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import StreamProvider from "@/components/providers/stream-provider";
import AuthAlert from "@/components/auth-alert";
import Navbar from "@/components/nav-bar";
import { getCurrentUser } from "@/lib/actions/auth.action";

import "./globals.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";

export const metadata: Metadata = {
  title: "Talk - Video Conferencing App",
  description:
    "Talk is a modern video conferencing app built with Next.js and React for seamless communication.",
  keywords: [
    "video conferencing",
    "Next.js",
    "React",
    "real-time communication",
    "web app",
    "Talk app",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="scroll-smooth antialiased">
        <StreamProvider>
          <Navbar user={user} />
          <AuthAlert />
          <main className="mx-auto max-w-5xl px-3 py-6">{children}</main>
        </StreamProvider>
        <Toaster />
      </body>
    </html>
  );
}
