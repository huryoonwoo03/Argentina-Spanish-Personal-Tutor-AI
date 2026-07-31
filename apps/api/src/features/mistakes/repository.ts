import type { Mistake } from "@che-speak/shared-types";
import { AppError } from "../../core/errors/index.js";
import { supabaseAdmin } from "../../core/supabase/client.js";

function requireClient() {
  if (!supabaseAdmin) throw AppError.aiProvider("Supabase is not configured");
  return supabaseAdmin;
}

export async function listUnresolved(userId: string, limit = 10): Promise<Mistake[]> {
  const { data, error } = await requireClient()
    .from("mistakes")
    .select("*")
    .eq("user_id", userId)
    .eq("resolved", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw AppError.aiProvider("Failed to load mistakes", error);

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    category: row.category,
    description: row.description,
    relatedVocabularyId: row.related_vocabulary_id,
    source: row.source,
    resolved: row.resolved,
    createdAt: row.created_at,
  }));
}

export async function record(
  userId: string,
  input: { category: string; description: string; relatedVocabularyId?: string; source?: string },
): Promise<void> {
  const { error } = await requireClient().from("mistakes").insert({
    user_id: userId,
    category: input.category,
    description: input.description,
    related_vocabulary_id: input.relatedVocabularyId ?? null,
    source: input.source ?? null,
  });

  if (error) throw AppError.aiProvider("Failed to record mistake", error);
}
