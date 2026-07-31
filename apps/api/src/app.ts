import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import { config } from "./core/config/index.js";
import { errorHandler } from "./core/middleware/errorHandler.js";
import { logger } from "./core/logger/index.js";
import { conversationRouter } from "./features/conversation/routes.js";
import { cultureRouter } from "./features/culture/routes.js";
import { dashboardRouter } from "./features/dashboard/routes.js";
import { healthRouter } from "./features/health/routes.js";
import { lessonsRouter } from "./features/lessons/routes.js";
import { createPracticeRouter } from "./features/practice/routes.js";
import { profileRouter } from "./features/profile/routes.js";
import { progressRouter } from "./features/progress/routes.js";
import { vocabularyRouter } from "./features/vocabulary/routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use("/health", healthRouter);

  app.use("/api/v1/profile", profileRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/vocabulary", vocabularyRouter);
  app.use("/api/v1/culture", cultureRouter);
  app.use("/api/v1/practice", createPracticeRouter("practice"));
  app.use("/api/v1/shadowing", createPracticeRouter("shadowing"));
  app.use("/api/v1/conversation", conversationRouter);
  app.use("/api/v1/lessons", lessonsRouter);
  app.use("/api/v1/progress", progressRouter);

  app.use(errorHandler);

  return app;
}
