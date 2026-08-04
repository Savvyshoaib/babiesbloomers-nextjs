"use client";

import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Uploads a file straight from the browser to Supabase Storage using a
 * signed upload URL + raw XHR, so large images never pass through a Next.js
 * Server Action (which has a small request body-size limit) and so we get
 * real upload progress via `xhr.upload.onprogress` (the Storage SDK's own
 * `.upload()` uses fetch and exposes no progress events).
 */
export async function uploadFileToStorage({
  bucket,
  file,
  onProgress,
}: {
  bucket: string;
  file: File;
  onProgress?: (percent: number) => void;
}): Promise<string> {
  const isImage =
    file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".ico");
  if (!isImage) {
    throw new Error(`"${file.name}" is not an image.`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`"${file.name}" is larger than 5MB.`);
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data: signed, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (signError || !signed) {
    throw new Error(signError?.message || "Could not start the upload.");
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.signedUrl);
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`"${file.name}" upload failed (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error(`Network error uploading "${file.name}".`));

    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    xhr.send(body);
  });

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Deletes the underlying Storage object for a public URL previously
 * returned by `uploadFileToStorage`. No-ops if the URL isn't from this
 * bucket (e.g. a legacy/external URL). */
export async function deleteFileFromStorage(
  bucket: string,
  publicUrl: string,
): Promise<void> {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;

  const path = publicUrl.slice(idx + marker.length);
  if (!path) return;

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(error.message || "Could not delete the image.");
  }
}
