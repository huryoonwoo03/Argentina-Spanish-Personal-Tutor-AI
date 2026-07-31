import OpenAI, { toFile } from "openai";
import type { SpeechToTextProvider, TranscriptionResult } from "../types.js";

export class WhisperProvider implements SpeechToTextProvider {
  readonly name = "whisper";
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async transcribe(audio: Buffer, mimeType: string): Promise<TranscriptionResult> {
    const extension = mimeType.split("/")[1] ?? "webm";
    const file = await toFile(audio, `audio.${extension}`, { type: mimeType });

    const response = await this.client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    const words = "words" in response && Array.isArray(response.words)
      ? response.words.map((w) => ({
          text: w.word,
          startMs: Math.round(w.start * 1000),
          endMs: Math.round(w.end * 1000),
        }))
      : undefined;

    return { text: response.text, words };
  }
}
