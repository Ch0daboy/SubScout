// Centralized logging utility for SubScout server
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogContext {
  userId?: string;
  endpoint?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: unknown): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` | Error: ${error instanceof Error ? error.message : String(error)}` : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
  }

  error(message: string, context?: LogContext, error?: unknown): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, context, error));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  // Convenience method for API endpoint errors
  apiError(endpoint: string, operation: string, error: unknown, userId?: string): void {
    this.error(`API Error in ${operation}`, {
      endpoint,
      operation,
      userId,
    }, error);
  }

  // Convenience method for API success logs
  apiSuccess(endpoint: string, operation: string, userId?: string, metadata?: Record<string, unknown>): void {
    this.info(`API Success: ${operation}`, {
      endpoint,
      operation,
      userId,
      metadata,
    });
  }
}

export const logger = new Logger();