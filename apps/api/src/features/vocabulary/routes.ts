import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../core/auth/middleware.js";
import { AppError } from "../../core/errors/index.js";
import * as profileRepo from "../profile/repository.js";
import * as repo from "./repository.js";

export const vocabularyRouter = Router();

const listQuerySchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  category: z.enum(["slang", "idiom", "expression", "formal", "internet"]).optional(),
  region: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

vocabularyRouter.get("/recommended", requireAuth, async (req, res, next) => {
  try {
    const learnerProfile = await profileRepo.getLearnerProfile(req.user!.id);
    const items = await repo.getRecommended(req.user!.id, learnerProfile.vocabularyLevel);
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

vocabularyRouter.get("/:id", async (req, res, next) => {
  try {
    res.json({ data: await repo.getById(req.params.id) });
  } catch (err) {
    next(err);
  }
});

vocabularyRouter.get("/", async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) throw AppError.validation("Invalid query", parsed.error.issues);
    res.json({ data: await repo.list(parsed.data) });
  } catch (err) {
    next(err);
  }
});

const reviewSchema = z.object({ outcome: z.enum(["again", "hard", "good", "easy"]) });

vocabularyRouter.post("/:id/review", requireAuth, async (req, res, next) => {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.validation("Invalid review outcome", parsed.error.issues);
    await repo.recordReview(req.user!.id, req.params.id, parsed.data.outcome);
    res.json({ data: { recorded: true } });
  } catch (err) {
    next(err);
  }
});
