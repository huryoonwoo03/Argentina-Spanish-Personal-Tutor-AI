import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../core/auth/middleware.js";
import { AppError } from "../../core/errors/index.js";
import * as service from "./service.js";

export const conversationRouter = Router();
conversationRouter.use(requireAuth);

conversationRouter.post("/sessions", async (req, res, next) => {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title : undefined;
    res.status(201).json({ data: await service.startSession(req.user!.id, title) });
  } catch (err) {
    next(err);
  }
});

conversationRouter.get("/sessions", async (req, res, next) => {
  try {
    res.json({ data: await service.listSessions(req.user!.id) });
  } catch (err) {
    next(err);
  }
});

conversationRouter.get("/sessions/:id/messages", async (req, res, next) => {
  try {
    res.json({ data: await service.listMessages(req.user!.id, req.params.id) });
  } catch (err) {
    next(err);
  }
});

const messageSchema = z.object({ content: z.string().min(1).max(2000) });

conversationRouter.post("/sessions/:id/messages", async (req, res, next) => {
  try {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.validation("Invalid message", parsed.error.issues);
    const reply = await service.sendMessage(req.user!.id, req.params.id, parsed.data.content);
    res.json({ data: reply });
  } catch (err) {
    next(err);
  }
});
