import { randomUUID } from "node:crypto";
import type { LessonContent } from "@che-speak/shared-types";
import { z } from "zod";
import { aiServices } from "../../core/ai/index.js";
import { FRESHNESS, getOrGenerate } from "../../core/content-cache/index.js";
import { AppError } from "../../core/errors/index.js";
import * as mistakesRepo from "../mistakes/repository.js";
import * as profileRepo from "../profile/repository.js";
import * as progressRepo from "../progress/repository.js";
import type { CachedContent } from "../../core/content-cache/index.js";

const exerciseSchema = z.object({
  prompt: z.string(),
  type: z.enum(["listen_repeat", "multiple_choice", "fill_blank", "free_response"]),
  referenceText: z.string().optional(),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
});

const lessonSchema = z.object({
  title: z.string(),
  summary: z.string(),
  exercises: z.array(exerciseSchema).min(3).max(6),
});

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const LESSON_XP = 20;

export async function getTodayLesson(userId: string): Promise<CachedContent<LessonContent>> {
  if (!aiServices.llm) throw AppError.aiProvider("LLM provider not configured");

  const [learnerProfile, recentMistakes] = await Promise.all([
    profileRepo.getLearnerProfile(userId),
    mistakesRepo.listUnresolved(userId, 5),
  ]);

  return getOrGenerate<LessonContent>({
    contentType: "lesson",
    topic: `daily-${todayIso()}`,
    level: learnerProfile.vocabularyLevel,
    userId,
    freshnessMs: FRESHNESS.LESSON,
    generate: async () => {
      const { data, model } = await aiServices.llm!.completeStructured(
        [
          {
            role: "system",
            content:
              "You design daily Rioplatense (Buenos Aires) Spanish lessons for an " +
              "immersion app. Generate 3-6 short exercises mixing listen_repeat, " +
              "multiple_choice, fill_blank, and free_response types. Weave in the " +
              "learner's interests and recently missed points naturally. Keep it " +
              "focused on one theme, not a grab bag.",
          },
          {
            role: "user",
            content: JSON.stringify({
              vocabularyLevel: learnerProfile.vocabularyLevel,
              learningPace: learnerProfile.learningPace,
              favoriteTopics: learnerProfile.favoriteTopics,
              goals: learnerProfile.goals,
              recentMistakes: recentMistakes.map((m) => m.description),
            }),
          },
        ],
        lessonSchema,
      );

      const content: LessonContent = {
        title: data.title,
        summary: data.summary,
        exercises: data.exercises.map((exercise) => ({ id: randomUUID(), ...exercise })),
        vocabularyIds: [],
      };

      return { data: content, model };
    },
  });
}

export async function completeLesson(userId: string): Promise<void> {
  await progressRepo.recordActivity(userId, { xpEarned: LESSON_XP, lessonsCompleted: 1 });
}
