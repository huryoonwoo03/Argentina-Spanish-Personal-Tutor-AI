import { Router } from "express";
import { requireAuth } from "../../core/auth/middleware.js";
import * as repo from "./repository.js";

export const progressRouter = Router();
progressRouter.use(requireAuth);

progressRouter.get("/summary", async (req, res, next) => {
  try {
    res.json({ data: await repo.getSummary(req.user!.id) });
  } catch (err) {
    next(err);
  }
});

progressRouter.get("/weak-sounds", async (req, res, next) => {
  try {
    const summary = await repo.getSummary(req.user!.id);
    res.json({ data: summary.weakSounds });
  } catch (err) {
    next(err);
  }
});

progressRouter.get("/heatmap", async (req, res, next) => {
  try {
    res.json({ data: await repo.getDailyProgress(req.user!.id, 365) });
  } catch (err) {
    next(err);
  }
});

progressRouter.get("/achievements", async (req, res, next) => {
  try {
    res.json({ data: await repo.getAchievements(req.user!.id) });
  } catch (err) {
    next(err);
  }
});
