import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import InsightsChart from "@/components/insights-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, TrendingUp, MessageCircle, ExternalLink } from "lucide-react";

export default function Insights() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedApp, setSelectedApp] = useState<string>("");

  // Apps query
  const { data: apps, isLoading: appsLoading } = useQuery({
    queryKey: ["/api/apps"],
    enabled: isAuthenticated,
  });

  // Pain points query
  const { data: painPoints, isLoading: painPointsLoading } = useQuery({
    queryKey: ["/api/insights/pain-points"],
    enabled: isAuthenticated,
  });

  // Trending topics query
  const { data: trendingTopics, isLoading: trendsLoading } = useQuery({
    queryKey: ["/api/insights/trending"],
    enabled: isAuthenticated,
  });

  // App insights query
  const { data: appInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/apps", selectedApp, "insights"],
    enabled: !!selectedApp,
  });

  // Set default app when apps load
  useEffect(() => {
    if (apps && apps.length > 0 && !selectedApp) {
      setSelectedApp(apps[0].id);
    }
  }, [apps, selectedApp]);

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

  const exportReport = () => {
    toast({
      title: "Export Started",
      description: "Your insights report is being prepared for download.",
    });
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-page-title">
                Customer Insights
              </h1>
              <p className="text-gray-600">
                Analyze pain points, trends, and customer feedback from community discussions.
              </p>
            </div>
            <Button 
              onClick={exportReport}
              variant="outline"
              className="flex items-center"
              data-testid="button-export-report"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* App Selector */}
        {apps && apps.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">View insights for:</label>
              <Select value={selectedApp} onValueChange={setSelectedApp}>
                <SelectTrigger className="w-64" data-testid="select-app">
                  <SelectValue placeholder="Select an app" />
                </SelectTrigger>
                <SelectContent>
                  {apps.map((app: any) => (
                    <SelectItem key={app.id} value={app.id} data-testid={`select-app-option-${app.id}`}>
                      {app.name || 'Untitled App'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {apps && apps.length === 0 && !appsLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4" data-testid="text-no-apps">
                No apps analyzed yet. Start by analyzing your app to see customer insights.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                data-testid="button-go-to-dashboard"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Pain Points Chart */}
            <Card data-testid="card-pain-points">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Top Pain Points (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {painPointsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : painPoints && painPoints.length > 0 ? (
                  <div>
                    <InsightsChart data={painPoints} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {painPoints.slice(0, 6).map((point: any, index: number) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between"
                          data-testid={`pain-point-${index}`}
                        >
                          <span className="text-sm text-gray-700" data-testid={`pain-point-title-${index}`}>
                            {point.title}
                          </span>
                          <span className="text-sm font-medium text-gray-900" data-testid={`pain-point-count-${index}`}>
                            {point.count} mentions
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500" data-testid="text-no-pain-points">
                      No pain points discovered yet. Start monitoring subreddits to gather insights.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card data-testid="card-trending-topics">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : trendingTopics && trendingTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((trend: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="text-sm"
                        data-testid={`trending-topic-${index}`}
                      >
                        {trend.tag} ({trend.count})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500" data-testid="text-no-trends">
                      No trending topics yet. Continue monitoring to identify patterns.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Discoveries */}
            <Card data-testid="card-recent-discoveries">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                  Recent Discoveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : appInsights && appInsights.length > 0 ? (
                  <div className="space-y-4">
                    {appInsights.slice(0, 5).map((insight: any, index: number) => (
                      <div 
                        key={insight.id}
                        className={`border-l-4 pl-4 ${
                          insight.type === 'pain_point' ? 'border-red-500' :
                          insight.type === 'feature_request' ? 'border-green-500' :
                          'border-blue-500'
                        }`}
                        data-testid={`insight-${index}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 mb-1" data-testid={`insight-source-${index}`}>
                              r/{insight.subreddit?.name} • {new Date(insight.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-900 mb-2" data-testid={`insight-title-${index}`}>
                              {insight.title}
                            </p>
                            <p className="text-sm text-gray-600 mb-2" data-testid={`insight-content-${index}`}>
                              {insight.content.length > 200 
                                ? `${insight.content.substring(0, 200)}...` 
                                : insight.content}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {insight.upvotes && (
                                <span data-testid={`insight-upvotes-${index}`}>
                                  ↑ {insight.upvotes} upvotes
                                </span>
                              )}
                              {insight.comments && (
                                <span data-testid={`insight-comments-${index}`}>
                                  💬 {insight.comments} comments
                                </span>
                              )}
                              <Badge 
                                variant={
                                  insight.type === 'pain_point' ? 'destructive' :
                                  insight.type === 'feature_request' ? 'default' :
                                  'secondary'
                                }
                                className="text-xs"
                                data-testid={`insight-type-${index}`}
                              >
                                {insight.type.replace('_', ' ')}
                              </Badge>
                              {insight.url && (
                                <a 
                                  href={insight.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-primary hover:text-primary/80"
                                  data-testid={`insight-link-${index}`}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500" data-testid="text-no-discoveries">
                      No insights discovered yet. Start monitoring subreddits to see customer feedback.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
