import Anthropic from "@anthropic-ai/sdk";
import type { ZodType } from "zod";
import { AppError } from "../../errors/index.js";
import type { LLMMessage, LLMProvider, LLMResult } from "../types.js";

const MODEL = "claude-sonnet-4-5";

// Anthropic's published per-token pricing for the default model, used only
// for cost logging/observability — not billing.
const USD_PER_INPUT_TOKEN = 3 / 1_000_000;
const USD_PER_OUTPUT_TOKEN = 15 / 1_000_000;

export class ClaudeProvider implements LLMProvider {
  readonly name = "claude";
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(messages: LLMMessage[]): Promise<LLMResult<string>> {
    const system = messages.find((m) => m.role === "system")?.content;
    const rest = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: rest,
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return {
      data: text,
      model: MODEL,
      usage: this.toUsage(response.usage.input_tokens, response.usage.output_tokens),
    };
  }

  async completeStructured<T>(
    messages: LLMMessage[],
    schema: ZodType<T>,
  ): Promise<LLMResult<T>> {
    const jsonInstruction: LLMMessage = {
      role: "system",
      content: "Respond with ONLY a single valid JSON object. No prose, no markdown fences.",
    };

    const { data: raw, model, usage } = await this.complete([jsonInstruction, ...messages]);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw AppError.aiProvider("Claude response was not valid JSON", { raw });
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw AppError.aiProvider("Claude response failed schema validation", {
        issues: result.error.issues,
      });
    }

    return { data: result.data, model, usage };
  }

  private toUsage(inputTokens: number, outputTokens: number) {
    return {
      inputTokens,
      outputTokens,
      costUsd: inputTokens * USD_PER_INPUT_TOKEN + outputTokens * USD_PER_OUTPUT_TOKEN,
    };
  }
}
