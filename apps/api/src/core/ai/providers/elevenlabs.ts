import { AppError } from "../../errors/index.js";
import type { TextToSpeechProvider, VoiceProfile } from "../types.js";

const API_BASE = "https://api.elevenlabs.io/v1";

export class ElevenLabsProvider implements TextToSpeechProvider {
  readonly name = "elevenlabs";

  constructor(private readonly apiKey: string) {}

  async synthesize(text: string, voice: VoiceProfile): Promise<Buffer> {
    const response = await fetch(`${API_BASE}/text-to-speech/${voice.voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { speed: voice.speed },
      }),
    });

    if (!response.ok) {
      throw AppError.aiProvider("ElevenLabs synthesis failed", {
        status: response.status,
        body: await response.text(),
      });
    }

    return Buffer.from(await response.arrayBuffer());
  }
}
