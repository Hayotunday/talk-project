import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { Readable } from "stream";

// Helper function to upload a buffer to Cloudinary using a stream
function uploadToCloudinary(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "talk-project-avatars", // Optional: organize uploads into a folder
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer);

    return NextResponse.json({ secure_url: result.secure_url });
  } catch (error: any) {
    console.error("Upload to Cloudinary failed:", error);
    return NextResponse.json(
      { error: "Image upload failed", details: error.message },
      { status: 500 }
    );
  }
}
