import { createApp } from "./app.js";
import { config } from "./core/config/index.js";
import { logger } from "./core/logger/index.js";

const app = createApp();

app.listen(config.PORT, () => {
  logger.info(`Che, Speak! API listening on port ${config.PORT}`);
});
