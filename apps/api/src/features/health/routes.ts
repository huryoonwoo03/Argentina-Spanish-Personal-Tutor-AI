import { Router } from "express";
import { aiServices } from "../../core/ai/index.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      ai: {
        llm: aiServices.llm?.name ?? null,
        speechToText: aiServices.speechToText?.name ?? null,
        pronunciationScorer: aiServices.pronunciationScorer?.name ?? null,
        textToSpeech: aiServices.textToSpeech?.name ?? null,
      },
    },
  });
});
