export type PracticeSessionType = "practice" | "shadowing";

export interface PhonemeNote {
  phoneme: string;
  word: string;
  issue: string;
  tip: string;
}

export interface PronunciationScore {
  rhythm: number;
  intonation: number;
  authenticity: number;
  overall: number;
  phonemeNotes: PhonemeNote[];
  coaching: string;
}

export interface PracticeSession {
  id: string;
  userId: string;
  sessionType: PracticeSessionType;
  referenceText: string;
  audioUrl: string | null;
  transcript: string | null;
  pronunciationScore: PronunciationScore | null;
  createdAt: string;
}
