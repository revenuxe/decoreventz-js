import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

// Server-only — holds AWS_SECRET_ACCESS_KEY, must never reach the browser
// bundle (see api/upload/route.ts and api/vendor/upload/route.ts, its callers).
type S3Config = {
  region: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
};

let s3Client: S3Client | undefined;

export function getS3Config(): S3Config {
  const region = process.env.AWS_REGION;
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !bucketName || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "File uploads are not configured. Set AWS_REGION, AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
    );
  }

  return { region, bucketName, accessKeyId, secretAccessKey };
}

// Create the client only during an upload request. Otherwise Vercel's
// build-time route analysis fails when optional AWS settings are absent.
export function getS3Client() {
  if (s3Client) return s3Client;

  const { region, accessKeyId, secretAccessKey } = getS3Config();
  s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  return s3Client;
}
