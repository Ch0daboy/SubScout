import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeAppUrl, generateFirstContactPost, analyzePainPointTrends } from "./gemini.js";
import { discoverSubreddits } from "./perplexity.js";
import { redditAPI } from "./reddit.js";
import { supabase } from "./db.js";
import { isAuthenticated, syncUser, type AuthRequest } from "./supabaseAuth.js";
import { 
  validateBody, 
  validateQuery, 
  validateParams,
  commonSchemas,
  rateLimit,
  sanitizeString
} from "./validation.js";
import type { 
  InsertApp, 
  InsertSubreddit, 
  InsertPost, 
  InsertActivity 
} from "./storage.js";

export async function registerRoutes(app: Express): Promise<Server> {

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // App routes with validation and rate limiting
  app.post('/api/apps', 
    rateLimit({ windowMs: 60000, maxRequests: 5, message: 'Too many app analysis requests' }),
    isAuthenticated, 
    syncUser, 
    validateBody(commonSchemas.createApp),
    async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { url } = req.body;

      // Analyze the app URL using Gemini AI
      const analysis = await analyzeAppUrl(sanitizeString(url));

      const appData: InsertApp = {
        user_id: userId,
        url,
        name: analysis.name,
        description: analysis.description,
        target_audience: analysis.targetAudience,
        pain_points: analysis.painPoints,
        features: analysis.features,
        tags: analysis.tags,
      };

      const app = await storage.createApp(appData);

      // Log activity
      await storage.createActivity({
        user_id: userId,
        type: 'app_analyzed',
        description: `Analyzed app: ${analysis.name}`,
        metadata: { appId: app.id, url },
      });

      res.json(app);
    } catch (error) {
      console.error("Error creating app:", error);
      res.status(500).json({ message: "Failed to analyze app" });
    }
  });

  app.get('/api/apps', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const apps = await storage.getAppsByUserId(userId);
      res.json(apps);
    } catch (error) {
      console.error("Error fetching apps:", error);
      res.status(500).json({ message: "Failed to fetch apps" });
    }
  });

  app.get('/api/apps/:id', 
    isAuthenticated, 
    syncUser, 
    validateParams(commonSchemas.id),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      const app = await storage.getApp(id);
      
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }

      // Ensure user owns the app
      if (app.user_id !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(app);
    } catch (error) {
      console.error("Error fetching app:", error);
      res.status(500).json({ message: "Failed to fetch app" });
    }
  });

  // Subreddit routes
  app.post('/api/apps/:appId/subreddits/discover', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { appId } = req.params;

      const app = await storage.getApp(appId);
      if (!app || app.user_id !== userId) {
        return res.status(404).json({ message: "App not found" });
      }

      // Discover subreddits using Perplexity AI
      const recommendations = await discoverSubreddits(app.description || '', app.target_audience || '');

      // Enhance with real Reddit data and store discovered subreddits
      const subreddits = [];
      for (const rec of recommendations) {
        // Get real Reddit data to enhance the recommendation
        const redditInfo = await redditAPI.getSubredditInfo(rec.name);
        
        const subredditData: InsertSubreddit = {
          user_id: userId,
          app_id: appId,
          name: rec.name,
          display_name: redditInfo?.displayName || rec.displayName,
          description: redditInfo?.description || rec.description,
          subscribers: redditInfo?.subscribers || rec.subscribers,
          activity: rec.activity,
          match_score: rec.matchScore,
          is_monitored: false,
        };

        const subreddit = await storage.createSubreddit(subredditData);
        subreddits.push(subreddit);
      }

      // Log activity
      await storage.createActivity({
        user_id: userId,
        type: 'subreddits_discovered',
        description: `Discovered ${subreddits.length} subreddits for ${app.name}`,
        metadata: { appId, count: subreddits.length },
      });

      res.json(subreddits);
    } catch (error) {
      console.error("Error discovering subreddits:", error);
      res.status(500).json({ message: "Failed to discover subreddits" });
    }
  });

  app.get('/api/apps/:appId/subreddits', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const { appId } = req.params;
      const subreddits = await storage.getSubredditsByAppId(appId);
      res.json(subreddits);
    } catch (error) {
      console.error("Error fetching subreddits:", error);
      res.status(500).json({ message: "Failed to fetch subreddits" });
    }
  });

  app.patch('/api/subreddits/:id', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const subreddit = await storage.updateSubreddit(id, updateData);

      if (updateData.isMonitored) {
        await storage.createActivity({
          user_id: userId,
          type: 'subreddit_monitored',
          description: `Started monitoring r/${subreddit.name}`,
          metadata: { subredditId: id },
        });
      }

      res.json(subreddit);
    } catch (error) {
      console.error("Error updating subreddit:", error);
      res.status(500).json({ message: "Failed to update subreddit" });
    }
  });

  // Post routes
  app.post('/api/posts/generate', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { subredditId, appId } = req.body;

      const subreddit = await storage.getSubreddit(subredditId);
      const app = await storage.getApp(appId);

      if (!subreddit || !app || app.user_id !== userId) {
        return res.status(404).json({ message: "Subreddit or app not found" });
      }

      // Generate post using Gemini AI
      const postData = await generateFirstContactPost(
        subreddit.name,
        app.description || '',
        app.pain_points || []
      );

      const post = await storage.createPost({
        user_id: userId,
        app_id: appId,
        subreddit_id: subredditId,
        title: postData.title,
        content: postData.content,
        status: 'draft',
      });

      // Log activity
      await storage.createActivity({
        user_id: userId,
        type: 'post_generated',
        description: `Generated post for r/${subreddit.name}`,
        metadata: { postId: post.id, subredditId, appId },
      });

      res.json(post);
    } catch (error) {
      console.error("Error generating post:", error);
      res.status(500).json({ message: "Failed to generate post" });
    }
  });

  app.get('/api/posts', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      const posts = status 
        ? await storage.getPostsByStatus(userId, status as string)
        : await storage.getPostsByUserId(userId);

      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.patch('/api/posts/:id', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const post = await storage.updatePost(id, updateData);

      if (updateData.status === 'approved') {
        await storage.createActivity({
          user_id: userId,
          type: 'post_approved',
          description: `Approved post: ${post.title}`,
          metadata: { postId: id },
        });
      }

      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  // Insights routes
  app.get('/api/apps/:appId/insights', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const { appId } = req.params;
      const insights = await storage.getInsightsByAppId(appId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.get('/api/insights/pain-points', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;
      const painPoints = await storage.getTopPainPoints(userId, parseInt(limit as string));
      res.json(painPoints);
    } catch (error) {
      console.error("Error fetching pain points:", error);
      res.status(500).json({ message: "Failed to fetch pain points" });
    }
  });

  app.get('/api/insights/trending', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;
      const trends = await storage.getTrendingTopics(userId, parseInt(limit as string));
      res.json(trends);
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ message: "Failed to fetch trends" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20 } = req.query;
      const activities = await storage.getRecentActivities(userId, parseInt(limit as string));
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Reddit integration routes
  app.post('/api/subreddits/:id/scan', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const subreddit = await storage.getSubreddit(id);
      if (!subreddit || subreddit.user_id !== userId) {
        return res.status(404).json({ message: "Subreddit not found" });
      }

      // Scan subreddit for insights using Reddit API
      const scanResults = await redditAPI.scanSubredditForInsights(subreddit.name);
      
      // Store insights
      const insights = [];
      for (const painPoint of scanResults.painPoints) {
        const insight = await storage.createInsight({
          user_id: userId,
          app_id: subreddit.app_id,
          subreddit_id: id,
          type: 'pain_point',
          title: painPoint,
          content: painPoint,
          tags: { source: 'reddit_scan' }
        });
        insights.push(insight);
      }
      
      for (const featureRequest of scanResults.featureRequests) {
        const insight = await storage.createInsight({
          user_id: userId,
          app_id: subreddit.app_id,
          subreddit_id: id,
          type: 'feature_request',
          title: featureRequest,
          content: featureRequest,
          tags: { source: 'reddit_scan' }
        });
        insights.push(insight);
      }
      
      // Log activity
      await storage.createActivity({
        user_id: userId,
        type: 'subreddit_scanned',
        description: `Scanned r/${subreddit.name} for insights`,
        metadata: { subredditId: id, insightsFound: insights.length }
      });
      
      res.json({
        insights: insights.length,
        painPoints: scanResults.painPoints.length,
        featureRequests: scanResults.featureRequests.length,
        posts: scanResults.posts.length
      });
    } catch (error) {
      console.error("Error scanning subreddit:", error);
      res.status(500).json({ message: "Failed to scan subreddit" });
    }
  });

  app.get('/api/subreddits/:id/posts', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { limit = 25 } = req.query;
      
      const subreddit = await storage.getSubreddit(id);
      if (!subreddit || subreddit.user_id !== userId) {
        return res.status(404).json({ message: "Subreddit not found" });
      }

      // Get hot posts from Reddit API
      const posts = await redditAPI.getHotPosts(subreddit.name, parseInt(limit as string));
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching subreddit posts:", error);
      res.status(500).json({ message: "Failed to fetch subreddit posts" });
    }
  });

  app.post('/api/subreddits/:id/search', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { query, limit = 10 } = req.body;
      
      const subreddit = await storage.getSubreddit(id);
      if (!subreddit || subreddit.user_id !== userId) {
        return res.status(404).json({ message: "Subreddit not found" });
      }

      // Search subreddit using Reddit API
      const posts = await redditAPI.searchSubreddit(subreddit.name, query, parseInt(limit));
      
      res.json(posts);
    } catch (error) {
      console.error("Error searching subreddit:", error);
      res.status(500).json({ message: "Failed to search subreddit" });
    }
  });

  // Stats routes
  app.get('/api/stats', isAuthenticated, syncUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
