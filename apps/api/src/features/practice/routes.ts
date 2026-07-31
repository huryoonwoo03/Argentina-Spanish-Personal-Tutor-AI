import multer from "multer";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../core/auth/middleware.js";
import { AppError } from "../../core/errors/index.js";
import * as service from "./service.js";
import type { PracticeSessionType } from "@che-speak/shared-types";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const createSchema = z.object({ referenceText: z.string().min(1).max(500) });

/**
 * Practice and shadowing share the same session/scoring pipeline — the
 * only difference is which `session_type` gets recorded. See
 * ARCHITECTURE.md; a dedicated native-audio "clips" catalog for
 * shadowing is a follow-up once we have real Rioplatense audio assets.
 */
export function createPracticeRouter(sessionType: PracticeSessionType): Router {
  const router = Router();
  router.use(requireAuth);

  router.post("/sessions", async (req, res, next) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.validation("Invalid session request", parsed.error.issues);
      }
      const session = await service.createSession(
        req.user!.id,
        sessionType,
        parsed.data.referenceText,
      );
      res.status(201).json({ data: session });
    } catch (err) {
      next(err);
    }
  });

  router.get("/sessions", async (req, res, next) => {
    try {
      res.json({ data: await service.listSessions(req.user!.id, sessionType) });
    } catch (err) {
      next(err);
    }
  });

  router.get("/sessions/:id", async (req, res, next) => {
    try {
      res.json({ data: await service.getSession(req.user!.id, req.params.id) });
    } catch (err) {
      next(err);
    }
  });

  router.post("/sessions/:id/score", upload.single("audio"), async (req, res, next) => {
    try {
      if (!req.file) throw AppError.validation("Missing audio file");
      const session = await service.scoreSession(
        req.user!.id,
        req.params.id,
        req.file.buffer,
        req.file.mimetype,
      );
      res.json({ data: session });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
