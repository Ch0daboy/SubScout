import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryKeys, type Subreddit, type ApiResponse } from '@/types/api';
import { useAuth } from './useAuth';

interface InsightsData {
  title: string;
  count: number;
}

interface PostsData {
  id: string;
  title: string;
  status: string;
  [key: string]: any;
}

export function useSubreddits(appId?: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: appId ? queryKeys.appSubreddits(appId) : queryKeys.subreddits,
    queryFn: async (): Promise<Subreddit[]> => {
      const url = appId ? `/api/subreddits?appId=${appId}` : '/api/subreddits';
      const response = await fetch(url, { 
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subreddits');
      }
      
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDiscoverSubreddits() {
  return useMutation({
    mutationFn: async (data: { appId: string }): Promise<Subreddit[]> => {
      const response = await apiRequest('POST', '/api/subreddits/discover', data);
      return response.json();
    },
  });
}

export function useUpdateSubreddit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      subredditId, 
      data 
    }: { 
      subredditId: string; 
      data: { is_monitored?: boolean }; 
    }): Promise<Subreddit> => {
      const response = await apiRequest('PATCH', `/api/subreddits/${subredditId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subreddits });
    },
  });
}

export function useInsights() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['/api/insights'],
    queryFn: async (): Promise<any[]> => {
      const response = await fetch('/api/insights', { 
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePainPoints() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['/api/insights/pain-points'],
    queryFn: async (): Promise<InsightsData[]> => {
      const response = await fetch('/api/insights/pain-points', { 
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pain points');
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePosts() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['/api/posts'],
    queryFn: async (): Promise<PostsData[]> => {
      const response = await fetch('/api/posts', { 
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}