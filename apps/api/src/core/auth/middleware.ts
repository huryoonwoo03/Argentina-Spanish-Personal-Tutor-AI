import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/index.js";
import { supabaseAdmin } from "../supabase/client.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string | null };
    }
  }
}

/**
 * Verifies the Supabase JWT and attaches `req.user`. Authorization for
 * data access still happens in Postgres via RLS (auth.uid()) — this
 * middleware only establishes identity for the request.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    next(AppError.unauthenticated());
    return;
  }

  if (!supabaseAdmin) {
    next(AppError.aiProvider("Supabase is not configured"));
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    next(AppError.unauthenticated("Invalid or expired session"));
    return;
  }

  req.user = { id: data.user.id, email: data.user.email ?? null };
  next();
}
