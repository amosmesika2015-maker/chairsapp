import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

const useCloudinary =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (useCloudinary) {
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "chairsapp",
      transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
    });
    return NextResponse.json({ url: result.secure_url });
  }

  // Local fallback: save to public/uploads
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
