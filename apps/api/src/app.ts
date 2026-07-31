import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import { config } from "./core/config/index.js";
import { errorHandler } from "./core/middleware/errorHandler.js";
import { logger } from "./core/logger/index.js";
import { healthRouter } from "./features/health/routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use("/health", healthRouter);

  // Feature routers mount here as each module is implemented, e.g.:
  // app.use("/api/v1/profile", requireAuth, profileRouter);

  app.use(errorHandler);

  return app;
}
