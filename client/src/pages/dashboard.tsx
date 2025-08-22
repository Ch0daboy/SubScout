import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import AppAnalysis from "@/components/app-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lightbulb, MessageSquare, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Stats query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  // Recent activities query
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2" data-testid="text-welcome">
                  Welcome back!
                </h1>
                <p className="text-primary-100">Your customer development journey continues</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-stat-subreddits">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600 h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Subreddits</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-active-subreddits">
                    {statsLoading ? "..." : stats?.activeSubreddits || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stat-pain-points">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lightbulb className="text-green-600 h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pain Points Found</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-pain-points">
                    {statsLoading ? "..." : stats?.painPoints || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stat-posts">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MessageSquare className="text-yellow-600 h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Posts Drafted</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-posts-drafted">
                    {statsLoading ? "..." : stats?.postsDrafted || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stat-engagement">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="text-purple-600 h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-engagement-rate">
                    --
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* App Analysis Section */}
            <AppAnalysis />
            
            {/* Recent Activities */}
            <Card data-testid="card-recent-activities">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities && activities.length > 0 ? (
                      activities.slice(0, 5).map((activity: any, index: number) => (
                        <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-item-${index}`}>
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900" data-testid={`activity-description-${index}`}>
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500" data-testid={`activity-time-${index}`}>
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500" data-testid="text-no-activities">
                          No recent activities. Start by analyzing your app!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/subreddits'}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid="button-manage-subreddits"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="font-medium">Manage Subreddits</p>
                      <p className="text-sm text-gray-500">Discover and monitor communities</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/insights'}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid="button-view-insights"
                >
                  <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="font-medium">View Insights</p>
                      <p className="text-sm text-gray-500">Analyze pain points and trends</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => window.location.href = '/posts'}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid="button-draft-posts"
                >
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="font-medium">Draft Posts</p>
                      <p className="text-sm text-gray-500">Generate engagement content</p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
