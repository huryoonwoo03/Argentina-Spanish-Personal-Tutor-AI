export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "AI_PROVIDER_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  AI_PROVIDER_ERROR: 502,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  static unauthenticated(message = "Authentication required") {
    return new AppError("UNAUTHENTICATED", message);
  }

  static forbidden(message = "Not allowed") {
    return new AppError("FORBIDDEN", message);
  }

  static notFound(message = "Not found") {
    return new AppError("NOT_FOUND", message);
  }

  static validation(message: string, details?: unknown) {
    return new AppError("VALIDATION_ERROR", message, details);
  }

  static aiProvider(message: string, details?: unknown) {
    return new AppError("AI_PROVIDER_ERROR", message, details);
  }
}
