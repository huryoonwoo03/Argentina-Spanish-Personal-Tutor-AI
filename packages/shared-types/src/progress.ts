export interface DailyProgress {
  userId: string;
  activityDate: string;
  xpEarned: number;
  minutesPracticed: number;
  accentScore: number | null;
  lessonsCompleted: number;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string | null;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  earnedAt: string;
}

export interface Mistake {
  id: string;
  userId: string;
  category: string;
  description: string;
  relatedVocabularyId: string | null;
  source: string | null;
  resolved: boolean;
  createdAt: string;
}

export interface ProgressSummary {
  xpOverTime: { date: string; xp: number }[];
  accentScoreTrend: { date: string; score: number }[];
  weakSounds: { phoneme: string; missCount: number }[];
}
