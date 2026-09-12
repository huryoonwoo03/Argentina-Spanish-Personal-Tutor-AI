import "dotenv/config";
import { z } from "zod";

// Treat an empty string (e.g. `SUPABASE_URL=` from .env.example) as unset so
// optional keys degrade gracefully instead of failing validation.
const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  SUPABASE_URL: optional(z.string().url()),
  SUPABASE_SERVICE_ROLE_KEY: optional(z.string()),
  ANTHROPIC_API_KEY: optional(z.string()),
  ELEVENLABS_API_KEY: optional(z.string()),
  OPENAI_API_KEY: optional(z.string()),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const config = parsed.data;
