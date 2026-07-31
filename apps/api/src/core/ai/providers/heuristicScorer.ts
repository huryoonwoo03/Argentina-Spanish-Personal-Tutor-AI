import { z } from "zod";
import type {
  LLMProvider,
  PronunciationScorer,
  PronunciationScoreResult,
  TranscriptionResult,
} from "../types.js";

const coachingSchema = z.object({
  rhythm: z.number().min(0).max(100),
  intonation: z.number().min(0).max(100),
  authenticity: z.number().min(0).max(100),
  phonemeNotes: z.array(
    z.object({
      phoneme: z.string(),
      word: z.string(),
      issue: z.string(),
      tip: z.string(),
    }),
  ),
  coaching: z.string(),
});

/**
 * Default PronunciationScorer: no dedicated pronunciation-assessment
 * provider yet, so we combine a transcript-accuracy signal with an LLM
 * that reasons about rhythm/intonation/authenticity from the transcript
 * and reference text. Swap this adapter, not feature code, if we later
 * adopt a provider with native phoneme-level scoring.
 */
export class HeuristicPronunciationScorer implements PronunciationScorer {
  readonly name = "heuristic-llm";

  constructor(private readonly llm: LLMProvider) {}

  async score(
    transcription: TranscriptionResult,
    referenceText: string,
  ): Promise<PronunciationScoreResult> {
    const accuracy = wordAccuracy(referenceText, transcription.text);

    const { data } = await this.llm.completeStructured(
      [
        {
          role: "system",
          content:
            "You are an expert Rioplatense (Buenos Aires) Spanish accent coach. " +
            "Given a reference sentence and what the learner actually said " +
            "(from speech-to-text), score their delivery and give specific, " +
            "encouraging coaching. Never just say 'wrong' — always explain why, " +
            "how a native speaker would say it, and one concrete exercise. " +
            "Scores are 0-100.",
        },
        {
          role: "user",
          content: JSON.stringify({
            referenceText,
            learnerTranscript: transcription.text,
            transcriptWordAccuracy: accuracy,
          }),
        },
      ],
      coachingSchema,
    );

    const overall = Math.round(
      (data.rhythm + data.intonation + data.authenticity + accuracy * 100) / 4,
    );

    return { ...data, overall };
  }
}

function wordAccuracy(reference: string, actual: string): number {
  const refWords = normalize(reference);
  const actualWords = new Set(normalize(actual));

  if (refWords.length === 0) return 0;

  const matched = refWords.filter((word) => actualWords.has(word)).length;
  return matched / refWords.length;
}

// eslint-disable-next-line no-misleading-character-class
const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}
