import type { ZodType } from "zod";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface LLMResult<T> {
  data: T;
  model: string;
  usage: LLMUsage;
}

/**
 * Provider-agnostic LLM interface. Feature services depend on this, never
 * on a vendor SDK directly, so swapping/mixing providers is a new adapter
 * under core/ai/providers, not a rewrite of feature code.
 */
export interface LLMProvider {
  readonly name: string;
  complete(messages: LLMMessage[]): Promise<LLMResult<string>>;
  completeStructured<T>(
    messages: LLMMessage[],
    schema: ZodType<T>,
  ): Promise<LLMResult<T>>;
}

export interface TranscriptionResult {
  text: string;
  words?: { text: string; startMs: number; endMs: number }[];
}

export interface SpeechToTextProvider {
  readonly name: string;
  transcribe(audio: Buffer, mimeType: string): Promise<TranscriptionResult>;
}

export interface PhonemeNote {
  phoneme: string;
  word: string;
  issue: string;
  tip: string;
}

export interface PronunciationScoreResult {
  rhythm: number;
  intonation: number;
  authenticity: number;
  overall: number;
  phonemeNotes: PhonemeNote[];
  coaching: string;
}

/**
 * Kept separate from SpeechToTextProvider: today's plan is transcription
 * + heuristic scoring layered on top. If we adopt a provider with native
 * pronunciation assessment, only this adapter changes.
 */
export interface PronunciationScorer {
  readonly name: string;
  score(
    transcription: TranscriptionResult,
    referenceText: string,
  ): Promise<PronunciationScoreResult>;
}

export interface VoiceProfile {
  voiceId: string;
  speed: number;
}

export interface TextToSpeechProvider {
  readonly name: string;
  synthesize(text: string, voice: VoiceProfile): Promise<Buffer>;
}
