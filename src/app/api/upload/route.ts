import { NextResponse, type NextRequest } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/lib/supabase/server";
import { getS3Client, getS3Config } from "@/lib/s3";
import { s3PublicUrl, s3KeyFromUrl } from "@/lib/s3-url";
import {
  detectedImageMimeType,
  MAX_IMAGE_UPLOAD_BYTES,
  sanitizeFileName,
  sanitizeObjectPrefix,
} from "@/lib/image-sniff";

export const runtime = "nodejs";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  return isAdmin ? user : null;
}

function storageErrorMessage(error: unknown, action: "upload" | "delete") {
  const name = error && typeof error === "object" && "name" in error
    ? String(error.name)
    : "";

  if (name === "AccessDenied") {
    return `S3 denied the ${action}. Check the AWS IAM policy allows s3:${action === "upload" ? "PutObject" : "DeleteObject"} for this bucket.`;
  }
  if (name === "NoSuchBucket") return "The configured S3 bucket could not be found.";
  if (name === "PermanentRedirect") return "The configured AWS region does not match the S3 bucket region.";
  return `Could not ${action} the image. Check the AWS S3 environment variables and try again.`;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Every path out of this handler must be JSON, even on an unexpected
  // throw (e.g. missing/invalid AWS credentials) — otherwise Vercel's
  // platform-level 500 page (HTML) reaches the client and breaks
  // `res.json()` there with a confusing "Unexpected token '<'" instead of
  // a real error message.
  try {
    const form = await request.formData();
    const file = form.get("file");
    const pathPrefix = form.get("pathPrefix");
    const safePathPrefix = typeof pathPrefix === "string" ? sanitizeObjectPrefix(pathPrefix) : null;
    if (!(file instanceof File) || !safePathPrefix) {
      return NextResponse.json({ error: "Missing file or pathPrefix" }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_IMAGE_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Images must be 4 MB or smaller." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = detectedImageMimeType(buffer);
    if (!contentType) {
      return NextResponse.json(
        { error: `"${file.name}" doesn't look like a valid image — try saving the photo again` },
        { status: 400 },
      );
    }

    const key = `${safePathPrefix}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { bucketName } = getS3Config();
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
        ContentDisposition: "inline",
      }),
    );

    return NextResponse.json({ url: s3PublicUrl(key) });
  } catch (err) {
    console.error("[api/upload POST]", err);
    return NextResponse.json({ error: storageErrorMessage(err, "upload") }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { url } = (await request.json()) as { url?: string };
    const key = url ? s3KeyFromUrl(url) : null;
    // No-op for URLs that aren't in this bucket (e.g. a pasted external URL)
    // — deletes are always best-effort cleanup, never something to fail on.
    if (!key) return NextResponse.json({ ok: true });

    const { bucketName } = getS3Config();
    await getS3Client().send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/upload DELETE]", err);
    return NextResponse.json({ error: storageErrorMessage(err, "delete") }, { status: 500 });
  }
}
