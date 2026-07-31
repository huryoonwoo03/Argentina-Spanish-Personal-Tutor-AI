import type { ContentType, VocabularyLevel } from "./common";

export interface LessonExercise {
  id: string;
  prompt: string;
  type: "listen_repeat" | "multiple_choice" | "fill_blank" | "free_response";
  referenceText?: string;
  options?: string[];
  answer?: string;
}

export interface LessonContent {
  title: string;
  summary: string;
  exercises: LessonExercise[];
  vocabularyIds: string[];
}

export interface GeneratedContent<T = unknown> {
  id: string;
  contentType: ContentType;
  userId: string | null;
  topic: string;
  level: VocabularyLevel | null;
  content: T;
  model: string;
  freshnessExpiresAt: string;
  createdAt: string;
}

export type Lesson = GeneratedContent<LessonContent>;
