import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getAdminStorage } from "@/libs/firebase-admin";

// POST - Upload image to Firebase Storage
export async function POST(request: NextRequest) {
  try {
    console.log("=== Upload route started ===");
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const color = formData.get("color") as string;

    if (!file) {
      console.error("No file provided in request");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("File received:", file.name, file.type, file.size);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("Buffer created, size:", buffer.length);

    // Upload to Firebase Storage using Admin SDK
    const fileName = `${Date.now()}-${file.name}`;
    console.log("Getting storage instance...");
    
    const storage = getAdminStorage();
    console.log("Storage instance obtained");
    
    const bucket = storage.bucket();
    console.log("Bucket name:", bucket.name);
    console.log("Uploading file:", fileName);
    
    const fileRef = bucket.file(`products/${fileName}`);
    
    // Upload file
    console.log("Starting file upload...");
    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: {
        firebaseStorageDownloadTokens: crypto.randomUUID(),
      },
    });
    console.log("File uploaded successfully");

    // Make file publicly accessible
    console.log("Making file public...");
    await fileRef.makePublic();
    console.log("File made public");

    // Get download URL
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
    
    console.log("Upload successful:", downloadURL);

    return NextResponse.json({
      url: downloadURL,
      color: color || "",
    });
  } catch (error: any) {
    console.error("=== Upload error ===");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    console.error("Full error:", JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { error: error.message || "Upload failed", details: error.code },
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
