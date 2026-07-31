import { hasCached } from "../../core/content-cache/index.js";
import * as profileRepo from "../profile/repository.js";
import * as progressRepo from "../progress/repository.js";

const WEEKLY_XP_GOAL = 350;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface DashboardSummary {
  streak: number;
  xp: number;
  accentScore: number | null;
  weeklyGoalPct: number;
  hasTodayLesson: boolean;
}

export async function getDashboard(userId: string): Promise<DashboardSummary> {
  const learnerProfile = await profileRepo.getLearnerProfile(userId);

  const [daily, hasLesson] = await Promise.all([
    progressRepo.getDailyProgress(userId, 7),
    hasCached({
      contentType: "lesson",
      topic: `daily-${todayIso()}`,
      level: learnerProfile.vocabularyLevel,
      userId,
    }),
  ]);

  const weeklyXp = daily.reduce((sum, day) => sum + day.xpEarned, 0);
  const latestAccentScore = [...daily].reverse().find((d) => d.accentScore !== null)?.accentScore;

  return {
    streak: learnerProfile.currentStreak,
    xp: learnerProfile.totalXp,
    accentScore: latestAccentScore ?? null,
    weeklyGoalPct: Math.min(100, Math.round((weeklyXp / WEEKLY_XP_GOAL) * 100)),
    hasTodayLesson: hasLesson,
  };
}
