import type {
  Paginated,
  VocabularyCategory,
  VocabularyLevel,
  VocabularyItem,
} from "@che-speak/shared-types";
import { AppError } from "../../core/errors/index.js";
import { supabaseAdmin } from "../../core/supabase/client.js";

function requireClient() {
  if (!supabaseAdmin) throw AppError.aiProvider("Supabase is not configured");
  return supabaseAdmin;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItem(row: any): VocabularyItem {
  return {
    id: row.id,
    term: row.term,
    definition: row.definition,
    category: row.category,
    level: row.level,
    region: row.region,
    audioUrl: row.audio_url,
    examples: row.examples ?? [],
    isCurrent: row.is_current,
    supersededBy: row.superseded_by,
  };
}

export interface ListFilters {
  level?: VocabularyLevel;
  category?: VocabularyCategory;
  region?: string;
  cursor?: string;
  limit?: number;
}

export async function list(filters: ListFilters): Promise<Paginated<VocabularyItem>> {
  const limit = filters.limit ?? 20;
  const offset = filters.cursor ? Number(filters.cursor) : 0;

  let query = requireClient()
    .from("vocabulary_items")
    .select("*")
    .eq("is_current", true)
    .order("term", { ascending: true })
    .range(offset, offset + limit - 1);

  if (filters.level) query = query.eq("level", filters.level);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.region) query = query.eq("region", filters.region);

  const { data, error } = await query;
  if (error) throw AppError.aiProvider("Failed to list vocabulary", error);

  const items = (data ?? []).map(mapItem);
  return {
    items,
    nextCursor: items.length === limit ? String(offset + limit) : null,
  };
}

export async function getById(id: string): Promise<VocabularyItem> {
  const { data, error } = await requireClient()
    .from("vocabulary_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) throw AppError.notFound("Vocabulary item not found");
  return mapItem(data);
}

export async function getRecommended(
  userId: string,
  level: VocabularyLevel,
  limit = 10,
): Promise<VocabularyItem[]> {
  const client = requireClient();
  const now = new Date().toISOString();

  const { data: due, error: dueError } = await client
    .from("user_vocabulary_progress")
    .select("vocabulary_item_id, vocabulary_items(*)")
    .eq("user_id", userId)
    .lte("next_review_at", now)
    .order("next_review_at", { ascending: true })
    .limit(limit);

  if (dueError) throw AppError.aiProvider("Failed to load due reviews", dueError);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dueItems = (due ?? []).map((row: any) => mapItem(row.vocabulary_items)).filter(Boolean);

  if (dueItems.length >= limit) return dueItems.slice(0, limit);

  const { data: seen } = await client
    .from("user_vocabulary_progress")
    .select("vocabulary_item_id")
    .eq("user_id", userId);

  const seenIds = new Set((seen ?? []).map((row) => row.vocabulary_item_id));
  const remaining = limit - dueItems.length;

  const { data: fresh, error: freshError } = await client
    .from("vocabulary_items")
    .select("*")
    .eq("level", level)
    .eq("is_current", true)
    .limit(remaining + seenIds.size);

  if (freshError) throw AppError.aiProvider("Failed to load new vocabulary", freshError);

  const freshItems = (fresh ?? [])
    .filter((row) => !seenIds.has(row.id))
    .slice(0, remaining)
    .map(mapItem);

  return [...dueItems, ...freshItems];
}

const MASTERY_DELTA: Record<string, number> = { again: -10, hard: 5, good: 15, easy: 25 };
const INTERVAL_DAYS: Record<string, number> = { again: 0, hard: 1, good: 3, easy: 7 };

export type ReviewOutcome = "again" | "hard" | "good" | "easy";

export async function recordReview(
  userId: string,
  vocabularyItemId: string,
  outcome: ReviewOutcome,
): Promise<void> {
  const client = requireClient();

  const { data: existing } = await client
    .from("user_vocabulary_progress")
    .select("mastery_level, times_reviewed")
    .eq("user_id", userId)
    .eq("vocabulary_item_id", vocabularyItemId)
    .maybeSingle();

  const nextMastery = Math.min(
    100,
    Math.max(0, (existing?.mastery_level ?? 0) + MASTERY_DELTA[outcome]),
  );
  const intervalMs = INTERVAL_DAYS[outcome] * 24 * 60 * 60 * 1000;
  const nextReviewAt = new Date(Date.now() + Math.max(intervalMs, 10 * 60 * 1000)).toISOString();

  const { error } = await client.from("user_vocabulary_progress").upsert(
    {
      user_id: userId,
      vocabulary_item_id: vocabularyItemId,
      mastery_level: nextMastery,
      times_reviewed: (existing?.times_reviewed ?? 0) + 1,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: nextReviewAt,
    },
    { onConflict: "user_id,vocabulary_item_id" },
  );

  if (error) throw AppError.aiProvider("Failed to record vocabulary review", error);
}
