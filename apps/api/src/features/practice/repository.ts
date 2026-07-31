import type { PracticeSession, PracticeSessionType, PronunciationScore } from "@che-speak/shared-types";
import { AppError } from "../../core/errors/index.js";
import { supabaseAdmin } from "../../core/supabase/client.js";

function requireClient() {
  if (!supabaseAdmin) throw AppError.aiProvider("Supabase is not configured");
  return supabaseAdmin;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSession(row: any): PracticeSession {
  return {
    id: row.id,
    userId: row.user_id,
    sessionType: row.session_type,
    referenceText: row.reference_text,
    audioUrl: row.audio_url,
    transcript: row.transcript,
    pronunciationScore: row.pronunciation_score,
    createdAt: row.created_at,
  };
}

export async function create(
  userId: string,
  sessionType: PracticeSessionType,
  referenceText: string,
): Promise<PracticeSession> {
  const { data, error } = await requireClient()
    .from("practice_sessions")
    .insert({ user_id: userId, session_type: sessionType, reference_text: referenceText })
    .select("*")
    .single();

  if (error || !data) throw AppError.aiProvider("Failed to create practice session", error);
  return mapSession(data);
}

export async function getById(userId: string, id: string): Promise<PracticeSession> {
  const { data, error } = await requireClient()
    .from("practice_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw AppError.notFound("Practice session not found");
  return mapSession(data);
}

export async function list(
  userId: string,
  sessionType?: PracticeSessionType,
  limit = 20,
): Promise<PracticeSession[]> {
  let query = requireClient()
    .from("practice_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (sessionType) query = query.eq("session_type", sessionType);

  const { data, error } = await query;
  if (error) throw AppError.aiProvider("Failed to list practice sessions", error);
  return (data ?? []).map(mapSession);
}

export async function uploadAudio(
  userId: string,
  sessionId: string,
  audio: Buffer,
  mimeType: string,
): Promise<string> {
  const extension = mimeType.split("/")[1]?.split(";")[0] ?? "webm";
  const path = `${userId}/${sessionId}.${extension}`;

  const { error } = await requireClient()
    .storage.from("practice-audio")
    .upload(path, audio, { contentType: mimeType, upsert: true });

  if (error) throw AppError.aiProvider("Failed to upload audio", error);
  return path;
}

export async function saveScore(
  id: string,
  transcript: string,
  audioUrl: string,
  score: PronunciationScore,
): Promise<PracticeSession> {
  const { data, error } = await requireClient()
    .from("practice_sessions")
    .update({ transcript, audio_url: audioUrl, pronunciation_score: score })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw AppError.aiProvider("Failed to save score", error);
  return mapSession(data);
}
