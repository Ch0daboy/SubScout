import { Request, Response, NextFunction } from "express";
import { supabase } from "./db.js";

export interface AuthRequest extends Request {
  user: {
    id: string;
    email?: string;
  };
}

export function isAuthenticated(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header required' });
  }

  const token = authHeader.substring(7);
  
  // For now, we'll use a simple approach
  // In production, you'd verify the JWT token properly
  supabase.auth.getUser(token).then(({ data: { user }, error }) => {
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    
    next();
  }).catch(() => {
    res.status(401).json({ message: 'Invalid token' });
  });
}

export async function syncUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Ensure user profile exists
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: req.user.id,
        email: req.user.email,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error syncing user:', error);
    }
    
    next();
  } catch (error) {
    console.error('Error syncing user:', error);
    next(); // Continue even if sync fails
  }
}