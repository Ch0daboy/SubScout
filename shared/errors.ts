export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN';

export interface AppErrorOptions {
  code?: ErrorCode;
  status?: number;
  userMessage?: string;
  details?: unknown;
  cause?: unknown;
}

export class AppError extends Error {
  code: ErrorCode;
  status?: number;
  userMessage: string;
  details?: unknown;
  override cause?: unknown;

  constructor(message: string, opts: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.code = opts.code ?? 'UNKNOWN';
    this.status = opts.status;
    this.userMessage =
      opts.userMessage ??
      (this.code === 'NETWORK_ERROR'
        ? 'Network error. Check your connection and try again.'
        : 'Something went wrong. Please try again.');
    this.details = opts.details;
    this.cause = opts.cause;
  }
}

export function toAppError(err: unknown, fallback?: Partial<AppErrorOptions>): AppError {
  if (err instanceof AppError) return err;

  // Fetch Response-like error normalization
  if (typeof err === 'object' && err !== null) {
    const anyErr = err as any;
    if (typeof anyErr.status === 'number' && typeof anyErr.message === 'string') {
      return new AppError(anyErr.message, {
        status: anyErr.status,
        code: statusToCode(anyErr.status),
        userMessage: anyErr.userMessage,
        details: anyErr.details,
        ...fallback,
        cause: err,
      });
    }
  }

  // Generic Error
  if (err instanceof Error) {
    return new AppError(err.message, {
      code: fallback?.code ?? 'UNKNOWN',
      userMessage: fallback?.userMessage,
      details: fallback?.details,
      cause: err,
    });
  }

  return new AppError(String(err), { code: fallback?.code ?? 'UNKNOWN', ...fallback, cause: err });
}

export function statusToCode(status?: number): ErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMITED';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'INTERNAL_ERROR';
    default:
      return 'UNKNOWN';
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError || (typeof e === 'object' && e !== null && (e as any).name === 'AppError');
}

export function withUserMessage(e: AppError, message: string): AppError {
  return new AppError(e.message, { ...e, userMessage: message });
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };

export async function asResult<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: toAppError(e) };
  }
}

