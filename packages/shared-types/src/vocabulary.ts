import type { VocabularyCategory, VocabularyLevel } from "./common";

export interface VocabularyExample {
  spanish: string;
  english: string;
  audioUrl?: string;
}

export interface VocabularyItem {
  id: string;
  term: string;
  definition: string;
  category: VocabularyCategory;
  level: VocabularyLevel;
  region: string;
  audioUrl: string | null;
  examples: VocabularyExample[];
  isCurrent: boolean;
  supersededBy: string | null;
}

export interface UserVocabularyProgress {
  userId: string;
  vocabularyItemId: string;
  masteryLevel: number;
  timesReviewed: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
}
