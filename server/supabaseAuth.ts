import type { Request, Response, NextFunction } from "express";
import { createClient } from '@supabase/supabase-js';
import { storage } from './storage.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
}

// Service role client for server-side operations
const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization header required' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseServiceRole.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }

    // Attach comprehensive user info to request
    (req as AuthRequest).user = {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.first_name,
      lastName: user.user_metadata?.last_name,
      profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}

export async function syncUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      next();
      return;
    }

    // Sync user data with our database using storage layer
    await storage.upsertUser({
      id: authReq.user.id,
      email: authReq.user.email,
      first_name: authReq.user.firstName,
      last_name: authReq.user.lastName,
      profile_image_url: authReq.user.profileImageUrl
    });

    next();
  } catch (error) {
    console.error('User sync error:', error);
    // Continue anyway - don't block requests for sync failures
    next();
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authReq = req as AuthRequest;
  
  if (!authReq.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  
  next();
}

// Middleware to check if user owns a resource
export function requireResourceOwnership(resourceUserIdField = 'user_id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];
    
    if (!authReq.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    if (resourceUserId && resourceUserId !== authReq.user.id) {
      res.status(403).json({ message: 'Access denied - resource ownership required' });
      return;
    }
    
    next();
  };
}