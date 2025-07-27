import { ReactNode } from "react";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import ClientProvider from "@/components/providers/client-provider";
import Navbar from "@/components/nav-bar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="scroll-smooth antialiased">
        <ClientProvider>
          <Navbar />
          <main className="mx-auto max-w-5xl px-3 py-6">{children}</main>
        </ClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
