import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

// URL validation schema
export const urlSchema = z.string().url().refine((url) => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}, 'Must be a valid HTTP/HTTPS URL');

// App creation validation
export const createAppSchema = z.object({
  url: urlSchema,
});

// Subreddit name validation (Reddit username/subreddit rules)
export const subredditNameSchema = z.string()
  .min(3, 'Subreddit name must be at least 3 characters')
  .max(21, 'Subreddit name must be at most 21 characters')
  .regex(/^[A-Za-z0-9_]+$/, 'Subreddit name can only contain letters, numbers, and underscores')
  .refine((name) => !name.startsWith('_'), 'Subreddit name cannot start with underscore')
  .refine((name) => !name.endsWith('_'), 'Subreddit name cannot end with underscore');

// Post content validation
export const postContentSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(300, 'Title must be at most 300 characters')
    .trim(),
  content: z.string()
    .min(1, 'Content is required')
    .max(40000, 'Content must be at most 40,000 characters')
    .trim(),
  status: z.enum(['draft', 'approved', 'published']).optional()
});

// Search query validation
export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(500, 'Search query must be at most 500 characters')
    .trim()
    .refine((query) => {
      // Basic SQL injection prevention
      const sqlKeywords = /\b(drop|delete|insert|update|create|alter|exec|execute|union|select)\b/i;
      return !sqlKeywords.test(query);
    }, 'Invalid search query'),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

// Pagination validation
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

// ID validation (UUID format)
export const idSchema = z.string().uuid('Invalid ID format');

// Input sanitization utilities
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000); // Limit length
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/[<>\"']/g, (match) => {
      const entityMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entityMap[match];
    });
}

// Validation middleware factory
export function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({
          message: 'Validation failed',
          errors
        });
        return;
      }
      
      // Replace request body with validated and transformed data
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ message: 'Validation failed' });
    }
  };
}

// Query parameter validation middleware
export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({
          message: 'Query validation failed',
          errors
        });
        return;
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      console.error('Query validation error:', error);
      res.status(500).json({ message: 'Query validation failed' });
    }
  };
}

// Parameter validation middleware
export function validateParams<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({
          message: 'Parameter validation failed',
          errors
        });
        return;
      }
      
      req.params = result.data;
      next();
    } catch (error) {
      console.error('Parameter validation error:', error);
      res.status(500).json({ message: 'Parameter validation failed' });
    }
  };
}

// Rate limiting helper
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Clean old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < windowStart) {
        rateLimitStore.delete(k);
      }
    }
    
    const record = rateLimitStore.get(key);
    
    if (!record) {
      rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
      next();
      return;
    }
    
    if (record.resetTime < now) {
      record.count = 1;
      record.resetTime = now + config.windowMs;
      next();
      return;
    }
    
    if (record.count >= config.maxRequests) {
      res.status(429).json({
        message: config.message || 'Too many requests, please try again later',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
      return;
    }
    
    record.count++;
    next();
  };
}

// Common validation schemas for reuse
export const commonSchemas = {
  id: z.object({ id: idSchema }),
  appId: z.object({ appId: idSchema }),
  subredditId: z.object({ subredditId: idSchema }),
  createApp: createAppSchema,
  postContent: postContentSchema,
  searchQuery: searchQuerySchema,
  pagination: paginationSchema
};