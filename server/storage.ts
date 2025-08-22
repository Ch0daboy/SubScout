import {
  users,
  apps,
  subreddits,
  insights,
  posts,
  activities,
  type User,
  type UpsertUser,
  type App,
  type InsertApp,
  type Subreddit,
  type InsertSubreddit,
  type Insight,
  type InsertInsight,
  type Post,
  type InsertPost,
  type Activity,
  type InsertActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum } from "drizzle-orm";

export interface IStorage {
  // User operations - integrated with Clerk Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // App operations
  createApp(app: InsertApp): Promise<App>;
  getAppsByUserId(userId: string): Promise<App[]>;
  getApp(id: string): Promise<App | undefined>;
  updateApp(id: string, app: Partial<InsertApp>): Promise<App>;
  
  // Subreddit operations
  createSubreddit(subreddit: InsertSubreddit): Promise<Subreddit>;
  getSubredditsByAppId(appId: string): Promise<Subreddit[]>;
  getMonitoredSubredditsByUserId(userId: string): Promise<Subreddit[]>;
  updateSubreddit(id: string, subreddit: Partial<InsertSubreddit>): Promise<Subreddit>;
  
  // Insight operations
  createInsight(insight: InsertInsight): Promise<Insight>;
  getInsightsByAppId(appId: string): Promise<Insight[]>;
  getTopPainPoints(userId: string, limit?: number): Promise<{ title: string; count: number }[]>;
  getTrendingTopics(userId: string, limit?: number): Promise<{ tag: string; count: number }[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPostsByUserId(userId: string): Promise<Post[]>;
  getPostsByStatus(userId: string, status: string): Promise<Post[]>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(userId: string, limit?: number): Promise<Activity[]>;
  
  // Stats operations
  getUserStats(userId: string): Promise<{
    activeSubreddits: number;
    painPoints: number;
    postsDrafted: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // App operations
  async createApp(app: InsertApp): Promise<App> {
    const [newApp] = await db.insert(apps).values(app).returning();
    return newApp;
  }

  async getAppsByUserId(userId: string): Promise<App[]> {
    return await db.select().from(apps).where(eq(apps.userId, userId)).orderBy(desc(apps.createdAt));
  }

  async getApp(id: string): Promise<App | undefined> {
    const [app] = await db.select().from(apps).where(eq(apps.id, id));
    return app;
  }

  async updateApp(id: string, appData: Partial<InsertApp>): Promise<App> {
    const [updatedApp] = await db
      .update(apps)
      .set({ ...appData, updatedAt: new Date() })
      .where(eq(apps.id, id))
      .returning();
    return updatedApp;
  }

  // Subreddit operations
  async createSubreddit(subreddit: InsertSubreddit): Promise<Subreddit> {
    const [newSubreddit] = await db.insert(subreddits).values(subreddit).returning();
    return newSubreddit;
  }

  async getSubredditsByAppId(appId: string): Promise<Subreddit[]> {
    return await db.select().from(subreddits).where(eq(subreddits.appId, appId));
  }

  async getMonitoredSubredditsByUserId(userId: string): Promise<Subreddit[]> {
    return await db
      .select()
      .from(subreddits)
      .where(and(eq(subreddits.userId, userId), eq(subreddits.isMonitored, true)));
  }

  async updateSubreddit(id: string, subredditData: Partial<InsertSubreddit>): Promise<Subreddit> {
    const [updatedSubreddit] = await db
      .update(subreddits)
      .set(subredditData)
      .where(eq(subreddits.id, id))
      .returning();
    return updatedSubreddit;
  }

  // Insight operations
  async createInsight(insight: InsertInsight): Promise<Insight> {
    const [newInsight] = await db.insert(insights).values(insight).returning();
    return newInsight;
  }

  async getInsightsByAppId(appId: string): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.appId, appId))
      .orderBy(desc(insights.createdAt));
  }

  async getTopPainPoints(userId: string, limit = 10): Promise<{ title: string; count: number }[]> {
    const results = await db
      .select({
        title: insights.title,
        count: count(insights.id),
      })
      .from(insights)
      .where(and(eq(insights.userId, userId), eq(insights.type, 'pain_point')))
      .groupBy(insights.title)
      .orderBy(desc(count(insights.id)))
      .limit(limit);

    return results.map(r => ({ title: r.title, count: r.count }));
  }

  async getTrendingTopics(userId: string, limit = 10): Promise<{ tag: string; count: number }[]> {
    // This is a simplified implementation - in practice you'd need more complex JSON querying
    const results = await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .orderBy(desc(insights.createdAt))
      .limit(100);

    // Extract and count tags
    const tagCounts: { [key: string]: number } = {};
    results.forEach(insight => {
      if (insight.tags) {
        insight.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getPostsByStatus(userId: string, status: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.status, status)))
      .orderBy(desc(posts.createdAt));
  }

  async updatePost(id: string, postData: Partial<InsertPost>): Promise<Post> {
    const [updatedPost] = await db
      .update(posts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return updatedPost;
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getRecentActivities(userId: string, limit = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    activeSubreddits: number;
    painPoints: number;
    postsDrafted: number;
  }> {
    const [activeSubreddits] = await db
      .select({ count: count() })
      .from(subreddits)
      .where(and(eq(subreddits.userId, userId), eq(subreddits.isMonitored, true)));

    const [painPointsCount] = await db
      .select({ count: count() })
      .from(insights)
      .where(and(eq(insights.userId, userId), eq(insights.type, 'pain_point')));

    const [postsDrafted] = await db
      .select({ count: count() })
      .from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.status, 'draft')));

    return {
      activeSubreddits: activeSubreddits.count,
      painPoints: painPointsCount.count,
      postsDrafted: postsDrafted.count,
    };
  }
}

export const storage = new DatabaseStorage();
