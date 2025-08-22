import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import SubredditDiscovery from "@/components/subreddit-discovery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Users, Activity, TrendingUp } from "lucide-react";

export default function Subreddits() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Apps query to show subreddits
  const { data: apps, isLoading: appsLoading } = useQuery({
    queryKey: ["/api/apps"],
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-page-title">
            Subreddit Management
          </h1>
          <p className="text-gray-600">
            Discover, monitor, and analyze Reddit communities where your customers gather.
          </p>
        </div>

        {/* App Selection and Discovery */}
        {apps && apps.length > 0 ? (
          <div className="space-y-8">
            {apps.map((app: any) => (
              <AppSubreddits key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4" data-testid="text-no-apps">
                No apps analyzed yet. Start by analyzing your app on the dashboard.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                data-testid="button-go-to-dashboard"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Component for individual app's subreddits
function AppSubreddits({ app }: { app: any }) {
  const [subreddits, setSubreddits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Query subreddits for this app
  const { data: subredditData, isLoading: subredditsLoading, refetch } = useQuery({
    queryKey: ["/api/apps", app.id, "subreddits"],
    enabled: !!app.id,
  });

  useEffect(() => {
    if (subredditData) {
      setSubreddits(subredditData);
    }
  }, [subredditData]);

  const toggleMonitoring = async (subredditId: string, isMonitored: boolean) => {
    try {
      const response = await fetch(`/api/subreddits/${subredditId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isMonitored }),
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }

      const updatedSubreddit = await response.json();
      
      setSubreddits(prev => 
        prev.map(s => s.id === subredditId ? updatedSubreddit : s)
      );

      toast({
        title: isMonitored ? "Monitoring Started" : "Monitoring Stopped",
        description: `r/${updatedSubreddit.name} ${isMonitored ? 'is now' : 'is no longer'} being monitored.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update monitoring status.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card data-testid={`card-app-${app.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              {app.name || 'Untitled App'}
              <Badge variant="outline" className="ml-2" data-testid={`badge-app-${app.id}`}>
                {subreddits.length} subreddits
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {app.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {subreddits.length === 0 ? (
          <SubredditDiscovery appId={app.id} onDiscovered={refetch} />
        ) : (
          <div className="space-y-4">
            {subreddits.map((subreddit: any) => (
              <div 
                key={subreddit.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                data-testid={`subreddit-item-${subreddit.id}`}
              >
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={subreddit.isMonitored}
                    onCheckedChange={(checked) => toggleMonitoring(subreddit.id, checked)}
                    data-testid={`switch-monitor-${subreddit.id}`}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900" data-testid={`text-subreddit-name-${subreddit.id}`}>
                      r/{subreddit.name}
                    </h3>
                    <p className="text-sm text-gray-600" data-testid={`text-subreddit-description-${subreddit.id}`}>
                      {subreddit.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {subreddit.subscribers ? `${(subreddit.subscribers / 1000).toFixed(0)}K` : '--'} members
                  </span>
                  <span className="flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    {subreddit.activity || 'Unknown'} activity
                  </span>
                  <Badge 
                    variant="outline" 
                    className="bg-green-50 text-green-700"
                    data-testid={`badge-match-score-${subreddit.id}`}
                  >
                    {subreddit.matchScore}% match
                  </Badge>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t">
              <SubredditDiscovery appId={app.id} onDiscovered={refetch} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
