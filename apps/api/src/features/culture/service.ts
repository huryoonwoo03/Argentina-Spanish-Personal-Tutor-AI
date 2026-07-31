import { z } from "zod";
import { aiServices } from "../../core/ai/index.js";
import { FRESHNESS, getOrGenerate } from "../../core/content-cache/index.js";
import type { CachedContent } from "../../core/content-cache/index.js";
import { AppError } from "../../core/errors/index.js";
import { CULTURE_TOPICS } from "./topics.js";

const cultureContentSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()).min(3).max(8),
  vocabulary: z.array(z.string()).min(2).max(8),
  discussionPrompt: z.string(),
});

export type CultureContent = z.infer<typeof cultureContentSchema>;

export function listTopics() {
  return CULTURE_TOPICS;
}

export async function getTopic(slug: string): Promise<CachedContent<CultureContent>> {
  const meta = CULTURE_TOPICS.find((t) => t.slug === slug);
  if (!meta) throw AppError.notFound("Culture topic not found");
  if (!aiServices.llm) throw AppError.aiProvider("LLM provider not configured");

  return getOrGenerate<CultureContent>({
    contentType: meta.isCurrentEvent ? "current_event" : "culture_topic",
    topic: slug,
    freshnessMs: meta.isCurrentEvent ? FRESHNESS.CURRENT_EVENT : FRESHNESS.CULTURE_EVERGREEN,
    generate: async () => {
      const { data, model } = await aiServices.llm!.completeStructured(
        [
          {
            role: "system",
            content:
              "You are a culturally fluent Argentine friend explaining Argentina to a " +
              "language learner. Be specific and current, not textbook-generic. For " +
              "current-events topics, ground it in what's actually happening now " +
              "rather than evergreen trivia. Stay neutral on partisan politics.",
          },
          { role: "user", content: `Topic: ${meta.title} (category: ${meta.category})` },
        ],
        cultureContentSchema,
      );
      return { data, model };
    },
  });
}
