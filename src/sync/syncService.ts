import type { SupabaseClient } from "@supabase/supabase-js";
import { useSyncStore } from "../stores/syncStore";
import { uploadScreenshotBytes } from "../storage/storageUpload";
import type { FeedbackPoint, Project } from "../types/project";

// ─── ensureCompany ────────────────────────────────────────────────────────────

export async function ensureCompany(supabase: SupabaseClient): Promise<string> {
  const cached = useSyncStore.getState().companyId;
  if (cached) return cached;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, company_id")
    .eq("id", user.id)
    .single();

  if (profileError) throw new Error(`Profile fetch failed: ${profileError.message}`);

  if (profile?.company_id) {
    useSyncStore.getState().setCompanyId(profile.company_id as string);
    return profile.company_id as string;
  }

  const { data: companyId, error: rpcError } = await supabase.rpc("ensure_company_for_user");
  if (rpcError || !companyId) {
    throw new Error(`Company creation failed: ${rpcError?.message ?? "unknown error"}`);
  }

  useSyncStore.getState().setCompanyId(companyId);
  return companyId;
}

// ─── ensureProject ────────────────────────────────────────────────────────────

export async function ensureProject(
  supabase: SupabaseClient,
  localProject: Project,
  companyId: string,
  userId?: string,
): Promise<string> {
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const createdBy = userId ?? currentUser?.id ?? "";

  const { error } = await supabase
    .from("projects")
    .upsert(
      {
        id: localProject.id,
        company_id: companyId,
        created_by: createdBy,
        name: localProject.name,
        description: localProject.description ?? null,
        project_type: localProject.projectType ?? "general",
        source: "desktop",
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();

  if (error) throw new Error(`Project sync failed: ${error.message}`);
  return localProject.id;
}

// ─── syncFeedbackItem ─────────────────────────────────────────────────────────

export async function syncFeedbackItem(
  supabase: SupabaseClient,
  feedbackItem: FeedbackPoint,
  projectId: string,
  companyId: string,
  screenshots?: {
    screenshotBytes?: Uint8Array;
    annotatedBytes?: Uint8Array;
  },
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    // Caller handles queuing — this function only syncs
    throw new Error("Offline — caller should enqueue");
  }

  const resolvedCompanyId = companyId || (await ensureCompany(supabase));

  let uploadedScreenshotPath: string | undefined;
  let uploadedAnnotatedPath: string | undefined;

  if (feedbackItem.screenshotPath && screenshots?.screenshotBytes) {
    try {
      await uploadScreenshotBytes(supabase, screenshots.screenshotBytes, resolvedCompanyId, projectId, feedbackItem.id, "screenshot.png");
      uploadedScreenshotPath = `${resolvedCompanyId}/${projectId}/${feedbackItem.id}/screenshot.png`;
    } catch (uploadErr) {
      console.warn("[syncFeedbackItem] screenshot upload failed:", uploadErr);
    }
  }

  if (feedbackItem.annotatedScreenshotPath && screenshots?.annotatedBytes) {
    try {
      await uploadScreenshotBytes(supabase, screenshots.annotatedBytes, resolvedCompanyId, projectId, feedbackItem.id, "annotated.png");
      uploadedAnnotatedPath = `${resolvedCompanyId}/${projectId}/${feedbackItem.id}/annotated.png`;
    } catch (uploadErr) {
      console.warn("[syncFeedbackItem] annotated screenshot upload failed:", uploadErr);
    }
  }

  const { error } = await supabase
    .from("feedback_items")
    .upsert(
      {
        id: feedbackItem.id,
        project_id: projectId,
        company_id: resolvedCompanyId,
        created_by: user.id,
        comment: feedbackItem.comment,
        media_timestamp: feedbackItem.timestamp ?? null,
        severity: feedbackItem.severity ?? null,
        tags: feedbackItem.tags,
        ...(uploadedScreenshotPath !== undefined ? { screenshot_path: uploadedScreenshotPath } : {}),
        ...(uploadedAnnotatedPath !== undefined ? { annotated_screenshot_path: uploadedAnnotatedPath } : {}),
      },
      { onConflict: "id" },
    )
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const now = new Date().toISOString();
  console.log(`[sync] feedback ${feedbackItem.id} synced at ${now}`);
  useSyncStore.getState().setLastSyncedAt(now);
}

// ─── deleteFeedbackItem ───────────────────────────────────────────────────────

export async function deleteFeedbackItem(
  supabase: SupabaseClient,
  feedbackId: string,
  projectId: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    const companyId = useSyncStore.getState().companyId || (await ensureCompany(supabase));

    const storagePaths = [
      `${companyId}/${projectId}/${feedbackId}/screenshot.png`,
      `${companyId}/${projectId}/${feedbackId}/annotated.png`,
    ];
    await supabase.storage.from("screenshots").remove(storagePaths);

    const { error } = await supabase.from("feedback_items").delete().eq("id", feedbackId);
    if (error) console.error("[deleteFeedbackItem] DB delete failed:", error.message);
  } catch (err) {
    console.error("[deleteFeedbackItem] failed:", err);
  }
}

// ─── deleteProject ────────────────────────────────────────────────────────────

export async function deleteProject(
  supabase: SupabaseClient,
  projectId: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    // Delete all feedback items for this project first
    const { error: fbError } = await supabase
      .from("feedback_items")
      .delete()
      .eq("project_id", projectId);
    if (fbError) console.error("[deleteProject] feedback delete failed:", fbError.message);

    // Delete the project record
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);
    if (error) console.error("[deleteProject] DB delete failed:", error.message);
  } catch (err) {
    console.error("[deleteProject] failed:", err);
  }
}

// ─── syncProject ──────────────────────────────────────────────────────────────

export async function syncProject(supabase: SupabaseClient, project: Project): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  try {
    const companyId = await ensureCompany(supabase);
    await ensureProject(supabase, project, companyId, user.id);
    useSyncStore.getState().setLastSyncedAt(new Date().toISOString());
  } catch (err) {
    console.error("[syncProject] failed:", err);
  }
}
