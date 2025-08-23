import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types with proper interfaces
export interface PainPoint {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  frequency?: number;
}

export interface AppFeature {
  name: string;
  description?: string;
  category?: string;
}

export interface AppTag {
  name: string;
  category?: 'industry' | 'technology' | 'audience' | 'feature';
}

export interface InsightTags {
  [key: string]: string | number | boolean;
  source?: string;
  confidence?: number;
  category?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          profile_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      apps: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          name: string | null;
          description: string | null;
          target_audience: string | null;
          pain_points: PainPoint[] | null;
          features: AppFeature[] | null;
          tags: AppTag[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          name?: string | null;
          description?: string | null;
          target_audience?: string | null;
          pain_points?: PainPoint[] | null;
          features?: AppFeature[] | null;
          tags?: AppTag[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          name?: string | null;
          description?: string | null;
          target_audience?: string | null;
          pain_points?: PainPoint[] | null;
          features?: AppFeature[] | null;
          tags?: AppTag[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subreddits: {
        Row: {
          id: string;
          user_id: string;
          app_id: string;
          name: string;
          display_name: string;
          description: string | null;
          subscribers: number | null;
          activity: string | null;
          match_score: number | null;
          is_monitored: boolean | null;
          last_scanned: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          app_id: string;
          name: string;
          display_name: string;
          description?: string | null;
          subscribers?: number | null;
          activity?: string | null;
          match_score?: number | null;
          is_monitored?: boolean | null;
          last_scanned?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          app_id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          subscribers?: number | null;
          activity?: string | null;
          match_score?: number | null;
          is_monitored?: boolean | null;
          last_scanned?: string | null;
          created_at?: string;
        };
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          app_id: string;
          subreddit_id: string;
          type: string;
          title: string;
          content: string;
          url: string | null;
          upvotes: number | null;
          comments: number | null;
          sentiment: string | null;
          priority: string | null;
          tags: InsightTags | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          app_id: string;
          subreddit_id: string;
          type: string;
          title: string;
          content: string;
          url?: string | null;
          upvotes?: number | null;
          comments?: number | null;
          sentiment?: string | null;
          priority?: string | null;
          tags?: InsightTags | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          app_id?: string;
          subreddit_id?: string;
          type?: string;
          title?: string;
          content?: string;
          url?: string | null;
          upvotes?: number | null;
          comments?: number | null;
          sentiment?: string | null;
          priority?: string | null;
          tags?: InsightTags | null;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          app_id: string;
          subreddit_id: string;
          title: string;
          content: string;
          status: string;
          reddit_post_id: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          app_id: string;
          subreddit_id: string;
          title: string;
          content: string;
          status?: string;
          reddit_post_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          app_id?: string;
          subreddit_id?: string;
          title?: string;
          content?: string;
          status?: string;
          reddit_post_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          description: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          description: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          description?: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
    };
  };
}