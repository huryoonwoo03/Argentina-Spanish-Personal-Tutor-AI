import type { LearningPace, VocabularyLevel } from "./common";

export interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearnerProfile {
  userId: string;
  favoriteTopics: string[];
  hobbies: string[];
  profession: string | null;
  goals: string[];
  vocabularyLevel: VocabularyLevel;
  learningPace: LearningPace;
  confidenceLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  lastActiveDate: string | null;
}

export interface UserPreferences {
  userId: string;
  voiceSpeed: number;
  accentRegion: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
  uiLanguage: string;
}
