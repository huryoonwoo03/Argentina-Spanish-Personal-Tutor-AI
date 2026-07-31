export type VocabularyLevel = "beginner" | "intermediate" | "advanced";

export type VocabularyCategory =
  | "slang"
  | "idiom"
  | "expression"
  | "formal"
  | "internet";

export type ContentType =
  | "lesson"
  | "slang_explanation"
  | "culture_topic"
  | "current_event";

export type LearningPace = "relaxed" | "steady" | "intense";

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}
