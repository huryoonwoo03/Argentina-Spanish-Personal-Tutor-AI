import type { ConversationMessage, ConversationSession, Correction } from "@che-speak/shared-types";
import { AppError } from "../../core/errors/index.js";
import { supabaseAdmin } from "../../core/supabase/client.js";

function requireClient() {
  if (!supabaseAdmin) throw AppError.aiProvider("Supabase is not configured");
  return supabaseAdmin;
}

export async function createSession(
  userId: string,
  title?: string,
): Promise<ConversationSession> {
  const { data, error } = await requireClient()
    .from("conversation_sessions")
    .insert({ user_id: userId, title: title ?? null })
    .select("*")
    .single();

  if (error || !data) throw AppError.aiProvider("Failed to start conversation", error);
  return mapSession(data);
}

export async function listSessions(userId: string): Promise<ConversationSession[]> {
  const { data, error } = await requireClient()
    .from("conversation_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw AppError.aiProvider("Failed to list conversations", error);
  return (data ?? []).map(mapSession);
}

export async function getSession(userId: string, id: string): Promise<ConversationSession> {
  const { data, error } = await requireClient()
    .from("conversation_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw AppError.notFound("Conversation not found");
  return mapSession(data);
}

export async function touchSession(id: string): Promise<void> {
  await requireClient()
    .from("conversation_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function listMessages(
  conversationId: string,
  limit = 50,
): Promise<ConversationMessage[]> {
  const { data, error } = await requireClient()
    .from("conversation_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw AppError.aiProvider("Failed to load messages", error);
  return (data ?? []).map(mapMessage);
}

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  corrections: Correction[] = [],
  culturalNotes: string | null = null,
): Promise<ConversationMessage> {
  const { data, error } = await requireClient()
    .from("conversation_messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
      corrections,
      cultural_notes: culturalNotes,
    })
    .select("*")
    .single();

  if (error || !data) throw AppError.aiProvider("Failed to save message", error);
  return mapMessage(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSession(row: any): ConversationSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(row: any): ConversationMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    corrections: row.corrections ?? [],
    culturalNotes: row.cultural_notes,
    createdAt: row.created_at,
  };
}
