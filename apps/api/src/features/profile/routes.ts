import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../core/auth/middleware.js";
import { AppError } from "../../core/errors/index.js";
import * as repo from "./repository.js";

export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const [profile, learnerProfile, preferences] = await Promise.all([
      repo.getProfile(userId),
      repo.getLearnerProfile(userId),
      repo.getPreferences(userId),
    ]);
    res.json({ data: { profile, learnerProfile, preferences } });
  } catch (err) {
    next(err);
  }
});

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  avatarUrl: z.string().url().optional(),
});

profileRouter.patch("/", async (req, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.validation("Invalid profile update", parsed.error.issues);
    const profile = await repo.updateProfile(req.user!.id, parsed.data);
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
});

profileRouter.get("/learner", async (req, res, next) => {
  try {
    res.json({ data: await repo.getLearnerProfile(req.user!.id) });
  } catch (err) {
    next(err);
  }
});

const updateLearnerSchema = z.object({
  favoriteTopics: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),
  profession: z.string().max(120).nullable().optional(),
  goals: z.array(z.string()).optional(),
  vocabularyLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  learningPace: z.enum(["relaxed", "steady", "intense"]).optional(),
});

profileRouter.patch("/learner", async (req, res, next) => {
  try {
    const parsed = updateLearnerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.validation("Invalid learner profile update", parsed.error.issues);
    }
    res.json({ data: await repo.updateLearnerProfile(req.user!.id, parsed.data) });
  } catch (err) {
    next(err);
  }
});

profileRouter.get("/preferences", async (req, res, next) => {
  try {
    res.json({ data: await repo.getPreferences(req.user!.id) });
  } catch (err) {
    next(err);
  }
});

const updatePreferencesSchema = z.object({
  voiceSpeed: z.number().min(0.5).max(2).optional(),
  accentRegion: z.string().min(1).max(40).optional(),
  darkMode: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  uiLanguage: z.string().min(2).max(10).optional(),
});

profileRouter.patch("/preferences", async (req, res, next) => {
  try {
    const parsed = updatePreferencesSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.validation("Invalid preferences update", parsed.error.issues);
    }
    res.json({ data: await repo.updatePreferences(req.user!.id, parsed.data) });
  } catch (err) {
    next(err);
  }
});
