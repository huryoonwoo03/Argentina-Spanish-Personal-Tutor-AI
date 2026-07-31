import { config } from "../config/index.js";
import { ClaudeProvider } from "./providers/claude.js";
import { ElevenLabsProvider } from "./providers/elevenlabs.js";
import { HeuristicPronunciationScorer } from "./providers/heuristicScorer.js";
import { WhisperProvider } from "./providers/whisper.js";
import type {
  LLMProvider,
  PronunciationScorer,
  SpeechToTextProvider,
  TextToSpeechProvider,
} from "./types.js";

export type * from "./types.js";

/**
 * Single place feature services pull AI providers from. Swapping the
 * default adapter for any capability is a one-line change here — no
 * feature code depends on a vendor SDK directly.
 */
export interface AiServices {
  llm: LLMProvider | null;
  speechToText: SpeechToTextProvider | null;
  pronunciationScorer: PronunciationScorer | null;
  textToSpeech: TextToSpeechProvider | null;
}

function buildAiServices(): AiServices {
  const llm = config.ANTHROPIC_API_KEY ? new ClaudeProvider(config.ANTHROPIC_API_KEY) : null;
  const speechToText = config.OPENAI_API_KEY ? new WhisperProvider(config.OPENAI_API_KEY) : null;
  const pronunciationScorer = llm ? new HeuristicPronunciationScorer(llm) : null;
  const textToSpeech = config.ELEVENLABS_API_KEY
    ? new ElevenLabsProvider(config.ELEVENLABS_API_KEY)
    : null;

  return { llm, speechToText, pronunciationScorer, textToSpeech };
}

export const aiServices = buildAiServices();
