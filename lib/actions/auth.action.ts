"use server";

import { auth, db } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams & { idToken: string }) {
  const { uid, name, email, photo_url, idToken } = params;

  try {
    let photo = photo_url;
    if (photo && photo !== "") {
      const formData = new FormData();
      formData.append("file", photo);
      formData.append(
        "upload_preset",
        `${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}`
      );
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      photo = data.secure_url;
      // console.log("Image uploaded to Cloudinary:", photo);
    }

    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      display_name: name,
      email,
      photo_url: photo,
      createdAt: new Date(),
    });

    // Set session cookie to log the user in immediately
    await setSessionCookie(idToken);

    return {
      success: true,
      message: "Account created successfully.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const user = await auth.getUserByEmail(email);
    if (!user)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    // Also check if the user exists in your Firestore database
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      return {
        success: false,
        message: "User data not found. Please complete sign up.",
      };
    }

    await setSessionCookie(idToken);
    return { success: true };
  } catch (error: any) {
    console.error("Sign in failed:", error);
    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    const userData = userRecord.data();
    if (!userData) return null;

    // Firestore Timestamps are not serializable, so we convert them to a Date object.
    if (userData.createdAt && typeof userData.createdAt.toDate === "function") {
      userData.createdAt = userData.createdAt.toDate();
    }

    return {
      ...userData,
      uid: userRecord.id,
    } as User;
  } catch (error) {
    console.error("Error verifying session cookie:", error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
