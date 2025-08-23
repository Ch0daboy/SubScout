import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryKeys, type App, type ApiResponse } from '@/types/api';
import { useAuth } from './useAuth';

interface StatsData {
  activeSubreddits: number;
  painPoints: number;
  postsDrafted: number;
  [key: string]: number;
}

export function useApps() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.apps,
    queryFn: async (): Promise<App[]> => {
      const response = await apiRequest('GET', '/api/apps');
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useApp(appId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.app(appId),
    queryFn: async (): Promise<App> => {
      const response = await apiRequest('GET', `/api/apps/${appId}`);
      return response.json();
    },
    enabled: isAuthenticated && !!appId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { url: string }): Promise<App> => {
      const response = await apiRequest('POST', '/api/apps', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apps });
    },
  });
}

export function useStats() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['/api/stats'],
    queryFn: async (): Promise<StatsData> => {
      const response = await apiRequest('GET', '/api/stats');
      const data = await response.json();
      return data || { activeSubreddits: 0, painPoints: 0, postsDrafted: 0 };
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useActivities() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['/api/activities'],
    queryFn: async (): Promise<any[]> => {
      const response = await apiRequest('GET', '/api/activities');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });
}