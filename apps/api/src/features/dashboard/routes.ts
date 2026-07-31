import { Router } from "express";
import { requireAuth } from "../../core/auth/middleware.js";
import * as service from "./service.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (req, res, next) => {
  try {
    res.json({ data: await service.getDashboard(req.user!.id) });
  } catch (err) {
    next(err);
  }
});
