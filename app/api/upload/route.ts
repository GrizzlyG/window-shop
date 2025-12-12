import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getAdminStorage } from "@/libs/firebase-admin";

// POST - Upload image to Firebase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const color = formData.get("color") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage using Admin SDK
    const fileName = `${Date.now()}-${file.name}`;
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    
    console.log("Bucket name:", bucket.name);
    console.log("Uploading file:", fileName);
    
    const fileRef = bucket.file(`products/${fileName}`);
    
    // Upload file
    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: {
        firebaseStorageDownloadTokens: crypto.randomUUID(),
      },
    });

    // Make file publicly accessible
    await fileRef.makePublic();

    // Get download URL
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
    
    console.log("Upload successful:", downloadURL);

    return NextResponse.json({
      url: downloadURL,
      color: color || "",
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    console.error("Error details:", error.message, error.code);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

// DELETE - Delete image from Firebase Storage
export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      );
    }

    // Extract file path from URL
    const bucket = getAdminStorage().bucket();
    const urlParts = url.split(`${bucket.name}/`);
    const filePath = urlParts[1];

    if (!filePath) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Delete file
    const fileRef = bucket.file(filePath);
    await fileRef.delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}
