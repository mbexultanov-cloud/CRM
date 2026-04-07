import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createAttachment } from "@/app/actions";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const dealId = parseInt(formData.get("dealId") as string);

    if (!file || !dealId) {
      return NextResponse.json({ error: "Missing file or dealId" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const attachment = await createAttachment({
      dealId,
      fileName: file.name,
      fileUrl: `/uploads/${fileName}`,
      fileType: file.type,
      fileSize: file.size,
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}