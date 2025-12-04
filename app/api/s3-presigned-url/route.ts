import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.AWS_REGION) {
  throw new Error("AWS_REGION is not set");
}
if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error("AWS_ACCESS_KEY_ID is not set");
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS_SECRET_ACCESS_KEY is not set");
}
if (!process.env.AWS_S3_BUCKET_NAME) {
  throw new Error("AWS_S3_BUCKET_NAME is not set");
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get("fileName");
  const fileType = req.nextUrl.searchParams.get("fileType") || "image/jpeg";

  if (!fileName) {
    return NextResponse.json(
      { error: "fileName is required" },
      { status: 400 }
    );
  }

  try {
    const key = `sellyx/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!, 
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

    console.log("BUCKET:", process.env.AWS_S3_BUCKET_NAME);
    console.log("PRESIGNED URL:", url);

    return NextResponse.json({ url, key });
  } catch (err) {
    console.error("PRESIGN ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
