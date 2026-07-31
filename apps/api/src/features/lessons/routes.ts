import { Router } from "express";
import { requireAuth } from "../../core/auth/middleware.js";
import * as service from "./service.js";

export const lessonsRouter = Router();
lessonsRouter.use(requireAuth);

lessonsRouter.get("/today", async (req, res, next) => {
  try {
    const lesson = await service.getTodayLesson(req.user!.id);
    res.json({ data: lesson });
  } catch (err) {
    next(err);
  }
});

lessonsRouter.post("/:id/complete", async (req, res, next) => {
  try {
    await service.completeLesson(req.user!.id);
    res.json({ data: { completed: true } });
  } catch (err) {
    next(err);
  }
});
