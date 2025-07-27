"use server";

import { StreamClient } from "@stream-io/node-sdk";
import { getCurrentUser } from "@/lib/actions/auth.action";

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

if (!STREAM_API_KEY) throw new Error("Stream API key secret is missing");
if (!STREAM_API_SECRET) throw new Error("Stream API secret is missing");

export const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

export const tokenProvider = async () => {
  const user = await getCurrentUser();

  if (!user) throw new Error("User is not authenticated");

  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  const token = streamClient.generateUserToken({
    user_id: user.uid,
    exp: expirationTime,
    iat: issuedAt,
  });

  return token;
};
