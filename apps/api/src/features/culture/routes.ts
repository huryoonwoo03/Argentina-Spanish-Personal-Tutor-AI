import { Router } from "express";
import * as service from "./service.js";

export const cultureRouter = Router();

cultureRouter.get("/topics", (_req, res) => {
  res.json({ data: service.listTopics() });
});

cultureRouter.get("/topics/:slug", async (req, res, next) => {
  try {
    res.json({ data: await service.getTopic(req.params.slug) });
  } catch (err) {
    next(err);
  }
});
