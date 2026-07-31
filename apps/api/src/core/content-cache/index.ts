import { createHash } from "node:crypto";
import type { ContentType, VocabularyLevel } from "@che-speak/shared-types";
import { supabaseAdmin } from "../supabase/client.js";
import { AppError } from "../errors/index.js";

interface CacheKey {
  contentType: ContentType;
  topic: string;
  level?: VocabularyLevel | null;
  /** null = shareable across learners with the same key (e.g. a culture topic) */
  userId?: string | null;
}

interface GetOrGenerateArgs<T> extends CacheKey {
  /** How long generated content stays fresh before regeneration is triggered. */
  freshnessMs: number;
  generate: () => Promise<{ data: T; model: string }>;
}

export interface CachedContent<T> {
  id: string;
  content: T;
  model: string;
  createdAt: string;
  freshnessExpiresAt: string;
  fromCache: boolean;
}

function hashKey({ contentType, topic, level, userId }: CacheKey): string {
  const raw = `${contentType}:${topic.toLowerCase().trim()}:${level ?? "any"}:${userId ?? "shared"}`;
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Cache-in-front-of-generation pipeline shared by lessons and culture
 * content: look up a fresh cached row by content hash, and generate +
 * persist on miss. See ARCHITECTURE.md §2.3.
 */
export async function getOrGenerate<T>(args: GetOrGenerateArgs<T>): Promise<CachedContent<T>> {
  if (!supabaseAdmin) {
    throw AppError.aiProvider("Supabase is not configured");
  }

  const contentHash = hashKey(args);
  const now = new Date().toISOString();

  const { data: cached, error: lookupError } = await supabaseAdmin
    .from("generated_content")
    .select("id, content, model, created_at, freshness_expires_at")
    .eq("content_hash", contentHash)
    .gt("freshness_expires_at", now)
    .maybeSingle();

  if (lookupError) {
    throw AppError.aiProvider("Failed to look up cached content", lookupError);
  }

  if (cached) {
    return {
      id: cached.id,
      content: cached.content as T,
      model: cached.model,
      createdAt: cached.created_at,
      freshnessExpiresAt: cached.freshness_expires_at,
      fromCache: true,
    };
  }

  const { data: generated, model } = await args.generate();
  const freshnessExpiresAt = new Date(Date.now() + args.freshnessMs).toISOString();

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("generated_content")
    .upsert(
      {
        content_type: args.contentType,
        user_id: args.userId ?? null,
        topic: args.topic,
        level: args.level ?? null,
        content_hash: contentHash,
        content: generated,
        model,
        freshness_expires_at: freshnessExpiresAt,
      },
      { onConflict: "content_hash" },
    )
    .select("id, content, model, created_at, freshness_expires_at")
    .single();

  if (insertError || !inserted) {
    throw AppError.aiProvider("Failed to persist generated content", insertError);
  }

  return {
    id: inserted.id,
    content: inserted.content as T,
    model: inserted.model,
    createdAt: inserted.created_at,
    freshnessExpiresAt: inserted.freshness_expires_at,
    fromCache: false,
  };
}

/** Checks whether fresh cached content exists without triggering generation. */
export async function hasCached(args: CacheKey): Promise<boolean> {
  if (!supabaseAdmin) throw AppError.aiProvider("Supabase is not configured");

  const { data, error } = await supabaseAdmin
    .from("generated_content")
    .select("id")
    .eq("content_hash", hashKey(args))
    .gt("freshness_expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw AppError.aiProvider("Failed to check cached content", error);
  return Boolean(data);
}

export const FRESHNESS = {
  LESSON: 1000 * 60 * 60 * 24, // 1 day — personalized, but still cached per learner per day
  SLANG: 1000 * 60 * 60 * 24 * 14, // 2 weeks — slang shifts, but not hourly
  CULTURE_EVERGREEN: 1000 * 60 * 60 * 24 * 30, // food/history/etc.
  CURRENT_EVENT: 1000 * 60 * 60 * 12, // half a day — genuinely time-sensitive
};
