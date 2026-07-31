import type {
  Achievement,
  DailyProgress,
  ProgressSummary,
  UserAchievement,
} from "@che-speak/shared-types";
import { AppError } from "../../core/errors/index.js";
import { supabaseAdmin } from "../../core/supabase/client.js";

function requireClient() {
  if (!supabaseAdmin) throw AppError.aiProvider("Supabase is not configured");
  return supabaseAdmin;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / msPerDay);
}

export interface ActivityDelta {
  xpEarned?: number;
  minutesPracticed?: number;
  lessonsCompleted?: number;
  accentScore?: number;
}

/**
 * Records XP/practice-time/lesson-completion for today and updates streaks.
 * Every feature that awards progress (lessons, practice, shadowing) goes
 * through this single function so streak/XP logic lives in one place.
 */
export async function recordActivity(userId: string, delta: ActivityDelta): Promise<void> {
  const client = requireClient();
  const today = todayIso();

  const { data: existing } = await client
    .from("daily_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .maybeSingle();

  await client.from("daily_progress").upsert(
    {
      user_id: userId,
      activity_date: today,
      xp_earned: (existing?.xp_earned ?? 0) + (delta.xpEarned ?? 0),
      minutes_practiced: (existing?.minutes_practiced ?? 0) + (delta.minutesPracticed ?? 0),
      lessons_completed: (existing?.lessons_completed ?? 0) + (delta.lessonsCompleted ?? 0),
      accent_score: delta.accentScore ?? existing?.accent_score ?? null,
    },
    { onConflict: "user_id,activity_date" },
  );

  const { data: learnerProfile } = await client
    .from("learner_profiles")
    .select("current_streak, longest_streak, total_xp, last_active_date")
    .eq("user_id", userId)
    .single();

  if (!learnerProfile) return;

  let currentStreak = learnerProfile.current_streak;
  if (learnerProfile.last_active_date !== today) {
    const gap = learnerProfile.last_active_date
      ? daysBetween(today, learnerProfile.last_active_date)
      : null;
    currentStreak = gap === 1 ? currentStreak + 1 : 1;
  }

  await client
    .from("learner_profiles")
    .update({
      current_streak: currentStreak,
      longest_streak: Math.max(learnerProfile.longest_streak, currentStreak),
      total_xp: learnerProfile.total_xp + (delta.xpEarned ?? 0),
      last_active_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

export async function getDailyProgress(userId: string, days = 30): Promise<DailyProgress[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data, error } = await requireClient()
    .from("daily_progress")
    .select("*")
    .eq("user_id", userId)
    .gte("activity_date", since)
    .order("activity_date", { ascending: true });

  if (error) throw AppError.aiProvider("Failed to load daily progress", error);

  return (data ?? []).map((row) => ({
    userId: row.user_id,
    activityDate: row.activity_date,
    xpEarned: row.xp_earned,
    minutesPracticed: row.minutes_practiced,
    accentScore: row.accent_score,
    lessonsCompleted: row.lessons_completed,
  }));
}

export async function getSummary(userId: string): Promise<ProgressSummary> {
  const daily = await getDailyProgress(userId);

  const { data: sessions } = await requireClient()
    .from("practice_sessions")
    .select("pronunciation_score")
    .eq("user_id", userId)
    .not("pronunciation_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  const missCounts = new Map<string, number>();
  for (const session of sessions ?? []) {
    const score = session.pronunciation_score as { phonemeNotes?: { phoneme: string }[] } | null;
    for (const note of score?.phonemeNotes ?? []) {
      missCounts.set(note.phoneme, (missCounts.get(note.phoneme) ?? 0) + 1);
    }
  }

  return {
    xpOverTime: daily.map((d) => ({ date: d.activityDate, xp: d.xpEarned })),
    accentScoreTrend: daily
      .filter((d) => d.accentScore !== null)
      .map((d) => ({ date: d.activityDate, score: d.accentScore as number })),
    weakSounds: [...missCounts.entries()]
      .map(([phoneme, missCount]) => ({ phoneme, missCount }))
      .sort((a, b) => b.missCount - a.missCount)
      .slice(0, 10),
  };
}

export async function getAchievements(
  userId: string,
): Promise<{ achievement: Achievement; earned: UserAchievement | null }[]> {
  const client = requireClient();

  const [{ data: achievements, error: achError }, { data: earned, error: earnedError }] =
    await Promise.all([
      client.from("achievements").select("*"),
      client.from("user_achievements").select("*").eq("user_id", userId),
    ]);

  if (achError) throw AppError.aiProvider("Failed to load achievements", achError);
  if (earnedError) throw AppError.aiProvider("Failed to load earned achievements", earnedError);

  const earnedByAchievement = new Map((earned ?? []).map((row) => [row.achievement_id, row]));

  return (achievements ?? []).map((row) => {
    const earnedRow = earnedByAchievement.get(row.id);
    return {
      achievement: {
        id: row.id,
        code: row.code,
        title: row.title,
        description: row.description,
        icon: row.icon,
      },
      earned: earnedRow
        ? { userId, achievementId: row.id, earnedAt: earnedRow.earned_at }
        : null,
    };
  });
}
