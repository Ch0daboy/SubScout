import { supabase } from "./db.js";
import type { Database } from "../lib/supabase.js";

// Type definitions matching database schema
export type User = Database['public']['Tables']['profiles']['Row'];
export type UpsertUser = Database['public']['Tables']['profiles']['Insert'];
export type App = Database['public']['Tables']['apps']['Row'];
export type InsertApp = Database['public']['Tables']['apps']['Insert'];
export type Subreddit = Database['public']['Tables']['subreddits']['Row'];
export type InsertSubreddit = Database['public']['Tables']['subreddits']['Insert'];
export type Insight = Database['public']['Tables']['insights']['Row'];
export type InsertInsight = Database['public']['Tables']['insights']['Insert'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type InsertPost = Database['public']['Tables']['posts']['Insert'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type InsertActivity = Database['public']['Tables']['activities']['Insert'];

export interface IStorage {
  // User operations - integrated with Supabase Auth
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
  getSubreddit(id: string): Promise<Subreddit | undefined>;
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
    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const { data: user } = await supabase
      .from('profiles')
      .upsert({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (!user) throw new Error('Failed to upsert user');
    return user;
  }

  // App operations
  async createApp(app: InsertApp): Promise<App> {
    const { data: newApp } = await supabase
      .from('apps')
      .insert(app)
      .select()
      .single();
    
    if (!newApp) throw new Error('Failed to create app');
    return newApp;
  }

  async getAppsByUserId(userId: string): Promise<App[]> {
    const { data: apps } = await supabase
      .from('apps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return apps || [];
  }

  async getApp(id: string): Promise<App | undefined> {
    const { data: app } = await supabase
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();
    
    return app || undefined;
  }

  async updateApp(id: string, appData: Partial<InsertApp>): Promise<App> {
    const { data: updatedApp } = await supabase
      .from('apps')
      .update({
        ...appData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (!updatedApp) throw new Error('Failed to update app');
    return updatedApp;
  }

  // Subreddit operations
  async createSubreddit(subreddit: InsertSubreddit): Promise<Subreddit> {
    const { data: newSubreddit } = await supabase
      .from('subreddits')
      .insert(subreddit)
      .select()
      .single();
    
    if (!newSubreddit) throw new Error('Failed to create subreddit');
    return newSubreddit;
  }

  async getSubredditsByAppId(appId: string): Promise<Subreddit[]> {
    const { data: subreddits } = await supabase
      .from('subreddits')
      .select('*')
      .eq('app_id', appId);
    
    return subreddits || [];
  }

  async getSubreddit(id: string): Promise<Subreddit | undefined> {
    const { data: subreddit } = await supabase
      .from('subreddits')
      .select('*')
      .eq('id', id)
      .single();
    
    return subreddit || undefined;
  }

  async getMonitoredSubredditsByUserId(userId: string): Promise<Subreddit[]> {
    const { data: subreddits } = await supabase
      .from('subreddits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_monitored', true);
    
    return subreddits || [];
  }

  async updateSubreddit(id: string, subredditData: Partial<InsertSubreddit>): Promise<Subreddit> {
    const { data: updatedSubreddit } = await supabase
      .from('subreddits')
      .update(subredditData)
      .eq('id', id)
      .select()
      .single();
    
    if (!updatedSubreddit) throw new Error('Failed to update subreddit');
    return updatedSubreddit;
  }

  // Insight operations
  async createInsight(insight: InsertInsight): Promise<Insight> {
    const { data: newInsight } = await supabase
      .from('insights')
      .insert(insight)
      .select()
      .single();
    
    if (!newInsight) throw new Error('Failed to create insight');
    return newInsight;
  }

  async getInsightsByAppId(appId: string): Promise<Insight[]> {
    const { data: insights } = await supabase
      .from('insights')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });
    
    return insights || [];
  }

  async getTopPainPoints(userId: string, limit = 10): Promise<{ title: string; count: number }[]> {
    // This requires a more complex query - using RPC or aggregation
    // For now, let's get all pain points and aggregate in memory
    const { data: insights } = await supabase
      .from('insights')
      .select('title')
      .eq('user_id', userId)
      .eq('type', 'pain_point');
    
    if (!insights) return [];
    
    const counts: { [key: string]: number } = {};
    insights.forEach(insight => {
      counts[insight.title] = (counts[insight.title] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([title, count]) => ({ title, count }));
  }

  async getTrendingTopics(userId: string, limit = 10): Promise<{ tag: string; count: number }[]> {
    const { data: insights } = await supabase
      .from('insights')
      .select('tags')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (!insights) return [];
    
    const tagCounts: { [key: string]: number } = {};
    insights.forEach(insight => {
      if (insight.tags && Array.isArray(insight.tags)) {
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
    const { data: newPost } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();
    
    if (!newPost) throw new Error('Failed to create post');
    return newPost;
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return posts || [];
  }

  async getPostsByStatus(userId: string, status: string): Promise<Post[]> {
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    return posts || [];
  }

  async updatePost(id: string, postData: Partial<InsertPost>): Promise<Post> {
    const { data: updatedPost } = await supabase
      .from('posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (!updatedPost) throw new Error('Failed to update post');
    return updatedPost;
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const { data: newActivity } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    
    if (!newActivity) throw new Error('Failed to create activity');
    return newActivity;
  }

  async getRecentActivities(userId: string, limit = 20): Promise<Activity[]> {
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return activities || [];
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    activeSubreddits: number;
    painPoints: number;
    postsDrafted: number;
  }> {
    const [activeSubredditsResult, painPointsResult, postsDraftedResult] = await Promise.all([
      supabase
        .from('subreddits')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_monitored', true),
      
      supabase
        .from('insights')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('type', 'pain_point'),
      
      supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'draft'),
    ]);

    return {
      activeSubreddits: activeSubredditsResult.count || 0,
      painPoints: painPointsResult.count || 0,
      postsDrafted: postsDraftedResult.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
