import type { PracticeSession, PracticeSessionType } from "@che-speak/shared-types";
import { aiServices } from "../../core/ai/index.js";
import { AppError } from "../../core/errors/index.js";
import * as mistakesRepo from "../mistakes/repository.js";
import * as progressRepo from "../progress/repository.js";
import * as repo from "./repository.js";

const SESSION_XP = 10;
const LOW_SCORE_THRESHOLD = 70;

export async function createSession(
  userId: string,
  sessionType: PracticeSessionType,
  referenceText: string,
): Promise<PracticeSession> {
  return repo.create(userId, sessionType, referenceText);
}

export async function listSessions(
  userId: string,
  sessionType?: PracticeSessionType,
): Promise<PracticeSession[]> {
  return repo.list(userId, sessionType);
}

export async function getSession(userId: string, id: string): Promise<PracticeSession> {
  return repo.getById(userId, id);
}

export async function scoreSession(
  userId: string,
  sessionId: string,
  audio: Buffer,
  mimeType: string,
): Promise<PracticeSession> {
  if (!aiServices.speechToText) throw AppError.aiProvider("Speech-to-text is not configured");
  if (!aiServices.pronunciationScorer) {
    throw AppError.aiProvider("Pronunciation scoring is not configured");
  }

  const session = await repo.getById(userId, sessionId);

  const transcription = await aiServices.speechToText.transcribe(audio, mimeType);
  const score = await aiServices.pronunciationScorer.score(transcription, session.referenceText);
  const audioUrl = await repo.uploadAudio(userId, sessionId, audio, mimeType);
  const updated = await repo.saveScore(sessionId, transcription.text, audioUrl, score);

  await progressRepo.recordActivity(userId, {
    xpEarned: SESSION_XP,
    minutesPracticed: 1,
    accentScore: score.overall,
  });

  if (score.overall < LOW_SCORE_THRESHOLD) {
    for (const note of score.phonemeNotes.slice(0, 2)) {
      await mistakesRepo.record(userId, {
        category: `pronunciation:${note.phoneme}`,
        description: note.issue,
        source: `practice_session:${sessionId}`,
      });
    }
  }

  return updated;
}
