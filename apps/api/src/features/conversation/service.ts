import type { ConversationMessage, ConversationSession } from "@che-speak/shared-types";
import { z } from "zod";
import { aiServices } from "../../core/ai/index.js";
import { AppError } from "../../core/errors/index.js";
import * as mistakesRepo from "../mistakes/repository.js";
import * as profileRepo from "../profile/repository.js";
import * as progressRepo from "../progress/repository.js";
import * as repo from "./repository.js";

const MESSAGE_XP = 5;
const HISTORY_WINDOW = 10;

const replySchema = z.object({
  reply: z.string(),
  corrections: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      explanation: z.string(),
    }),
  ),
  culturalNotes: z.string().nullable(),
});

export async function startSession(userId: string, title?: string): Promise<ConversationSession> {
  return repo.createSession(userId, title);
}

export async function listSessions(userId: string): Promise<ConversationSession[]> {
  return repo.listSessions(userId);
}

export async function listMessages(
  userId: string,
  conversationId: string,
): Promise<ConversationMessage[]> {
  await repo.getSession(userId, conversationId); // ownership check
  return repo.listMessages(conversationId);
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  content: string,
): Promise<ConversationMessage> {
  if (!aiServices.llm) throw AppError.aiProvider("LLM provider not configured");

  await repo.getSession(userId, conversationId); // ownership check

  const [learnerProfile, history] = await Promise.all([
    profileRepo.getLearnerProfile(userId),
    repo.listMessages(conversationId, HISTORY_WINDOW),
  ]);

  await repo.addMessage(conversationId, "user", content);

  const { data } = await aiServices.llm.completeStructured(
    [
      {
        role: "system",
        content:
          "You are a warm, funny native Buenos Aires friend chatting in Rioplatense " +
          "Spanish (voseo, che, the full local register) with a language learner. " +
          "Reply naturally and keep the conversation flowing — never say 'wrong' or " +
          "break character to lecture. Instead, weave gentle corrections into a " +
          "separate `corrections` field (only when something is actually off) with a " +
          "short explanation, and add `culturalNotes` only when something you or the " +
          "learner said needs cultural context (slang, a reference, an idiom). " +
          "Match the learner's level and stated interests.",
      },
      {
        role: "user",
        content: JSON.stringify({
          learnerLevel: learnerProfile.vocabularyLevel,
          favoriteTopics: learnerProfile.favoriteTopics,
          hobbies: learnerProfile.hobbies,
          goals: learnerProfile.goals,
          recentHistory: history.slice(-HISTORY_WINDOW).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          learnerMessage: content,
        }),
      },
    ],
    replySchema,
  );

  const assistantMessage = await repo.addMessage(
    conversationId,
    "assistant",
    data.reply,
    data.corrections,
    data.culturalNotes,
  );

  await repo.touchSession(conversationId);
  await progressRepo.recordActivity(userId, { xpEarned: MESSAGE_XP, minutesPracticed: 1 });

  for (const correction of data.corrections) {
    await mistakesRepo.record(userId, {
      category: "conversation:grammar",
      description: correction.explanation,
      source: `conversation_message:${assistantMessage.id}`,
    });
  }

  return assistantMessage;
}
