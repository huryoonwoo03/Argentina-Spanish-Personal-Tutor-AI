import type { LearnerProfile, Profile, UserPreferences } from "@che-speak/shared-types";
import { AppError } from "../../core/errors/index.js";
import { supabaseAdmin } from "../../core/supabase/client.js";

function requireClient() {
  if (!supabaseAdmin) throw AppError.aiProvider("Supabase is not configured");
  return supabaseAdmin;
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await requireClient()
    .from("profiles")
    .select("id, display_name, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error || !data) throw AppError.notFound("Profile not found");

  return {
    id: data.id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "displayName" | "avatarUrl">>,
): Promise<Profile> {
  const { data, error } = await requireClient()
    .from("profiles")
    .update({
      ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
      ...(patch.avatarUrl !== undefined ? { avatar_url: patch.avatarUrl } : {}),
    })
    .eq("id", userId)
    .select("id, display_name, avatar_url, created_at, updated_at")
    .single();

  if (error || !data) throw AppError.aiProvider("Failed to update profile", error);

  return {
    id: data.id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getLearnerProfile(userId: string): Promise<LearnerProfile> {
  const { data, error } = await requireClient()
    .from("learner_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) throw AppError.notFound("Learner profile not found");

  return mapLearnerProfile(data);
}

export async function updateLearnerProfile(
  userId: string,
  patch: Partial<
    Pick<
      LearnerProfile,
      "favoriteTopics" | "hobbies" | "profession" | "goals" | "vocabularyLevel" | "learningPace"
    >
  >,
): Promise<LearnerProfile> {
  const { data, error } = await requireClient()
    .from("learner_profiles")
    .update({
      ...(patch.favoriteTopics !== undefined ? { favorite_topics: patch.favoriteTopics } : {}),
      ...(patch.hobbies !== undefined ? { hobbies: patch.hobbies } : {}),
      ...(patch.profession !== undefined ? { profession: patch.profession } : {}),
      ...(patch.goals !== undefined ? { goals: patch.goals } : {}),
      ...(patch.vocabularyLevel !== undefined
        ? { vocabulary_level: patch.vocabularyLevel }
        : {}),
      ...(patch.learningPace !== undefined ? { learning_pace: patch.learningPace } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) throw AppError.aiProvider("Failed to update learner profile", error);

  return mapLearnerProfile(data);
}

export async function getPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await requireClient()
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) throw AppError.notFound("Preferences not found");

  return mapPreferences(data);
}

export async function updatePreferences(
  userId: string,
  patch: Partial<
    Pick<
      UserPreferences,
      "voiceSpeed" | "accentRegion" | "darkMode" | "notificationsEnabled" | "uiLanguage"
    >
  >,
): Promise<UserPreferences> {
  const { data, error } = await requireClient()
    .from("user_preferences")
    .update({
      ...(patch.voiceSpeed !== undefined ? { voice_speed: patch.voiceSpeed } : {}),
      ...(patch.accentRegion !== undefined ? { accent_region: patch.accentRegion } : {}),
      ...(patch.darkMode !== undefined ? { dark_mode: patch.darkMode } : {}),
      ...(patch.notificationsEnabled !== undefined
        ? { notifications_enabled: patch.notificationsEnabled }
        : {}),
      ...(patch.uiLanguage !== undefined ? { ui_language: patch.uiLanguage } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) throw AppError.aiProvider("Failed to update preferences", error);

  return mapPreferences(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLearnerProfile(data: any): LearnerProfile {
  return {
    userId: data.user_id,
    favoriteTopics: data.favorite_topics ?? [],
    hobbies: data.hobbies ?? [],
    profession: data.profession,
    goals: data.goals ?? [],
    vocabularyLevel: data.vocabulary_level,
    learningPace: data.learning_pace,
    confidenceLevel: data.confidence_level,
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    totalXp: data.total_xp,
    lastActiveDate: data.last_active_date,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPreferences(data: any): UserPreferences {
  return {
    userId: data.user_id,
    voiceSpeed: Number(data.voice_speed),
    accentRegion: data.accent_region,
    darkMode: data.dark_mode,
    notificationsEnabled: data.notifications_enabled,
    uiLanguage: data.ui_language,
  };
}
