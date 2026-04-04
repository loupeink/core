import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Uploads screenshot bytes to Supabase Storage.
 * Accepts supabase client as first parameter — no global import.
 *
 * Storage path format: {companyId}/{projectId}/{feedbackId}/{filename}
 */
export async function uploadScreenshotBytes(
  supabase: SupabaseClient,
  bytes: Uint8Array,
  companyId: string,
  projectId: string,
  feedbackId: string,
  filename: string = "screenshot.png",
  contentType: string = "image/png",
): Promise<void> {
  const storagePath = `${companyId}/${projectId}/${feedbackId}/${filename}`;

  const { error } = await supabase.storage
    .from("screenshots")
    .upload(storagePath, bytes, { contentType, upsert: true });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
}
