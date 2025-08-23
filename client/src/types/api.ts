// API Response Types for SubScout
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse {
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

// App Types
export interface App {
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
}

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

// Subreddit Types
export interface Subreddit {
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
}

// Post Types
export interface Post {
  id: string;
  user_id: string;
  app_id: string;
  subreddit_id: string;
  title: string;
  content: string;
  status: 'draft' | 'approved' | 'published';
  reddit_post_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostUpdateData {
  title?: string;
  content?: string;
  status?: 'draft' | 'approved' | 'published';
}

// Insight Types
export interface Insight {
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
  tags: Record<string, any> | null;
  created_at: string;
}

// Activity Types
export interface Activity {
  id: string;
  user_id: string;
  type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  activeSubreddits: number;
  painPoints: number;
  postsDrafted: number;
}

// Chart Data
export interface ChartData {
  title: string;
  count: number;
}

// API Query Keys for React Query
export const queryKeys = {
  apps: ['apps'] as const,
  app: (id: string) => ['apps', id] as const,
  subreddits: ['subreddits'] as const,
  appSubreddits: (appId: string) => ['subreddits', appId] as const,
  posts: ['posts'] as const,
  insights: ['insights'] as const,
  activities: ['activities'] as const,
  stats: ['stats'] as const,
} as const;