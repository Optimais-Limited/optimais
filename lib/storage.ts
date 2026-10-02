// Server-only wrapper around Cloudflare R2 (S3-compatible) for Exhibition media.
// The bucket is PRIVATE — nothing is served from it directly. Uploads go straight from the
// browser to R2 via a presigned PUT URL (bypassing Vercel's ~4.5 MB request body cap); reads
// go through a short-lived presigned GET URL that our own API route hands out only once it has
// checked the post is APPROVED (or the viewer is its author/a moderator) — see lib/exhibitions.ts.
//
// Setup (one-time, in the Cloudflare dashboard for this account):
//   1. R2 → Create bucket (private — do not enable public access).
//   2. R2 → Manage API tokens → create an S3 API token, and set CORS on the bucket to allow
//      PUT/GET/HEAD from the site's origin(s) (done once via the Cloudflare API; see git history
//      of this file's commit message for the exact call).
//   3. Copy the Access Key ID, Secret Access Key and the account's S3 endpoint into .env
//      (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET). Never expose
//      R2_SECRET_ACCESS_KEY to the browser.

import { S3Client, HeadObjectCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ENDPOINT = process.env.R2_ENDPOINT;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || "";

export function storageConfigured(): boolean {
  return Boolean(ENDPOINT && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET);
}

let client: S3Client | null = null;
function s3(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: ENDPOINT,
      credentials: { accessKeyId: ACCESS_KEY_ID!, secretAccessKey: SECRET_ACCESS_KEY! }
    });
  }
  return client;
}

export type SignedUpload = { uploadUrl: string };

/** A one-time URL the browser can PUT the file to directly. Valid for 10 minutes. */
export async function createSignedUploadUrl(path: string, contentType: string): Promise<SignedUpload | { error: string }> {
  if (!storageConfigured()) return { error: "Media storage is not configured yet." };
  try {
    const uploadUrl = await getSignedUrl(
      s3(),
      new PutObjectCommand({ Bucket: BUCKET, Key: path, ContentType: contentType }),
      { expiresIn: 600 }
    );
    return { uploadUrl };
  } catch (err) {
    console.error("createSignedUploadUrl failed:", err);
    return { error: "Could not prepare the upload. Please try again." };
  }
}

export type ObjectInfo = { size: number; contentType: string };

/** Reads back what R2 actually stored, so we never trust the client's own claims about the file. */
export async function getObjectInfo(path: string): Promise<ObjectInfo | null> {
  if (!storageConfigured()) return null;
  try {
    const head = await s3().send(new HeadObjectCommand({ Bucket: BUCKET, Key: path }));
    return { size: head.ContentLength ?? 0, contentType: head.ContentType ?? "" };
  } catch (err) {
    return null;
  }
}

/** First `length` bytes of the object, used to check an image's real file signature. */
export async function readObjectPrefix(path: string, length: number): Promise<Uint8Array | null> {
  if (!storageConfigured()) return null;
  try {
    const res = await s3().send(new GetObjectCommand({ Bucket: BUCKET, Key: path, Range: `bytes=0-${length - 1}` }));
    const bytes = await res.Body?.transformToByteArray();
    return bytes ?? null;
  } catch (err) {
    console.error("readObjectPrefix threw:", err);
    return null;
  }
}

/** A short-lived URL for one GET, handed out only after the caller has checked the viewer may see it. */
export async function createSignedViewUrl(path: string, expiresIn = 300): Promise<string | null> {
  if (!storageConfigured()) return null;
  try {
    return await getSignedUrl(s3(), new GetObjectCommand({ Bucket: BUCKET, Key: path }), { expiresIn });
  } catch (err) {
    console.error("createSignedViewUrl failed:", err);
    return null;
  }
}

/** Best-effort delete; failures are logged, not thrown, so cleanup never blocks the caller. */
export async function deleteObject(path: string): Promise<void> {
  if (!storageConfigured()) return;
  try {
    await s3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: path }));
  } catch (err) {
    console.error("deleteObject threw:", path, err);
  }
}
