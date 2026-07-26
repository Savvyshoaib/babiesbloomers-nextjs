"use server";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, ok, type ApiResponse } from "@/lib/api-response";

export async function uploadProductImages(
  formData: FormData,
): Promise<ApiResponse<{ urls: string[] }>> {
  await requireAdmin();

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return fail("Please select at least one image.");
  }

  const admin = createAdminClient();
  const urls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return fail(`File "${file.name}" is not an image.`);
    }
    if (file.size > 5 * 1024 * 1024) {
      return fail(`"${file.name}" is larger than 5MB.`);
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage
      .from("product-images")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return fail("Image upload failed.", error.message);
    }

    const { data } = admin.storage.from("product-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return ok("Images uploaded.", { urls });
}

export async function uploadSiteAssets(
  formData: FormData,
): Promise<ApiResponse<{ urls: string[] }>> {
  await requireAdmin();

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return fail("Please select at least one image.");
  }

  const admin = createAdminClient();
  const urls: string[] = [];

  for (const file of files) {
    const isImage =
      file.type.startsWith("image/") ||
      file.type === "image/x-icon" ||
      file.name.toLowerCase().endsWith(".ico");
    if (!isImage) {
      return fail(`File "${file.name}" is not an image.`);
    }
    if (file.size > 5 * 1024 * 1024) {
      return fail(`"${file.name}" is larger than 5MB.`);
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage.from("site-assets").upload(path, buffer, {
      contentType: file.type || "image/png",
      upsert: false,
    });

    if (error) {
      return fail("Upload failed.", error.message);
    }

    const { data } = admin.storage.from("site-assets").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return ok("Assets uploaded.", { urls });
}
