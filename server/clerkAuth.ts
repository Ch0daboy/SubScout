import { clerkMiddleware, requireAuth, getAuth } from "@clerk/express";
import type { Express, RequestHandler } from "express";
import cors from "cors";
import { storage } from "./storage";

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Configure CORS for Vercel deployment
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || true
      : ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
  }));

  // Use Clerk middleware
  app.use(clerkMiddleware());
}

export const isAuthenticated: RequestHandler = requireAuth({
  onError: (error) => {
    console.error('Authentication error:', error);
    return { message: "Authentication failed" };
  }
});

// Middleware to sync user with database
export const syncUser: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // For now, we'll use basic user info since we don't have the full user object
    // You might want to fetch full user details from Clerk if needed
    await storage.upsertUser({
      id: userId,
      email: `${userId}@clerk.local`, // Placeholder - replace with actual email if available
      firstName: null,
      lastName: null,
      profileImageUrl: null,
    });

    // Attach user info to request
    (req as any).user = {
      id: userId,
      email: null, // Will be populated from database if needed
    };

    next();
  } catch (error) {
    console.error('User sync error:', error);
    return res.status(500).json({ message: "User sync failed" });
  }
};